import WebSocket from "ws";
import { randomUUID } from "crypto";
import validator from "validator";

import check from "./check.js";
import sandbox from "./sandbox.js";
import authenticate from "./authenticate.js";

const collabRooms = {};
const RUN_WINDOW_MS = 60 * 1000;
const RUN_LIMIT_PER_WINDOW = Number.parseInt(
  process.env.WS_RUN_LIMIT_PER_MINUTE || "10",
  10
);
const CHECK_WINDOW_MS = 60 * 1000;
const CHECK_LIMIT_PER_WINDOW = 30;
const WS_MAX_FILES = 50;
const WS_MAX_FILE_BYTES = 512 * 1024;
const WS_MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const WS_MAX_INPUT_BYTES = 20 * 1024;

function sanitizeRunPath(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\\/g, "/")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 200);
}

function validRunFiles(files) {
  if (!files || typeof files !== "object") {
    return "Missing files.";
  }
  // Client sends an array of { folder, files: [...] }; accept plain maps too.
  const locations = Array.isArray(files) ? files : Object.values(files);
  let count = 0;
  let bytes = 0;
  for (const location of locations) {
    const folder = location && typeof location === "object" ? location.folder : "";
    const list = location && typeof location === "object" ? location.files : null;
    if (typeof folder !== "string" || !Array.isArray(list)) {
      return "Malformed files payload.";
    }
    const cleanFolder = sanitizeRunPath(folder);
    if (!cleanFolder || cleanFolder.includes("..")) {
      return "Invalid folder path.";
    }
    for (const file of list) {
      if (!file || typeof file !== "object") {
        return "Malformed files payload.";
      }
      const name = sanitizeRunPath(file.filename);
      if (!name || name.includes("..")) {
        return "Invalid file name.";
      }
      if (typeof file.content !== "string") {
        return "Malformed files payload.";
      }
      const fileBytes = Buffer.byteLength(file.content, "utf8");
      if (fileBytes > WS_MAX_FILE_BYTES) {
        return `File ${name} is too large to execute.`;
      }
      count += 1;
      bytes += fileBytes;
      if (count > WS_MAX_FILES || bytes > WS_MAX_TOTAL_BYTES) {
        return "Files payload too large.";
      }
    }
  }
  if (count === 0) {
    return "Missing files.";
  }
  return null;
}

function safeSend(ws, data) {
  if (ws.readyState !== WebSocket.OPEN) {
    return false;
  }

  ws.send(JSON.stringify(data));
  return true;
}

const configure = (wss) => {
  wss.on("connection", (ws, request) => {
    const id = randomUUID();
    const user = request.user;
    let room = null;
    let runInFlight = false;
    let runTimestamps = [];
    let checkTimestamps = [];

    const emit = (data, toSelf = true) => {
      let sent = false;

      if (room && collabRooms[room] && collabRooms[room][id] === ws) {
        data.count = Object.keys(collabRooms[room]).length;
        sent = true;

        for (const uuid of Object.keys(collabRooms[room])) {
          if (id === uuid && !toSelf) {
            continue;
          }

          safeSend(collabRooms[room][uuid], data);
        }
      }

      if (!sent) {
        safeSend(ws, data);
      }
    };

    const leave = () => {
      if (!room || !collabRooms[room] || !collabRooms[room][id]) {
        return;
      }

      if (Object.keys(collabRooms[room]).length === 1) {
        delete collabRooms[room];
      } else {
        delete collabRooms[room][id];
      }

      room = null;
    };

    ws.on("message", async (message) => {
      let data;
      try {
        data = JSON.parse(message.toString());
      } catch (error) {
        return emit({ type: "stderr", msg: "Malformed WebSocket message." });
      }

      if (!data?.type) {
        return;
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`[WS] ${user.username} ${data.type}`);
      }

      if (data.type === "ping") {
        emit({ type: "pong", msg: new Date() });
        return;
      }

      if (data.type === "run") {
        if (runInFlight) {
          return emit({
            type: "stderr",
            msg: "A code execution is already in progress for this connection.",
          });
        }

        const { files, lang, input } = data;
        const filesError = validRunFiles(files);
        if (filesError) {
          return emit({ type: "stderr", msg: filesError });
        }
        if (!lang || typeof lang !== "string" || lang.length > 50) {
          return emit({ type: "stderr", msg: "Missing language." });
        }
        if (input !== undefined && (typeof input !== "string" || Buffer.byteLength(input, "utf8") > WS_MAX_INPUT_BYTES)) {
          return emit({ type: "stderr", msg: "Input too large." });
        }

        const now = Date.now();
        runTimestamps = runTimestamps.filter(
          (timestamp) => timestamp > now - RUN_WINDOW_MS
        );
        if (runTimestamps.length >= RUN_LIMIT_PER_WINDOW) {
          return emit({
            type: "stderr",
            msg: "Too many code execution requests. Please wait a moment.",
          });
        }

        const stdin =
          input && typeof input === "string" ? [input] : [""];

        runTimestamps.push(now);
        runInFlight = true;
        emit({ type: "pending" });

        sandbox
          .runLang(lang, files, stdin, (result) => {
            if (result.stderr) {
              if (result.type === "compile") {
                emit({
                  type: "stderr",
                  msg: "There was an error compiling your code.\n\n",
                });
              } else {
                emit({
                  type: "stderr",
                  msg: "There was an error running your code.\n\n",
                });
              }
              emit({ type: "stderr", msg: result.stderr });
            }

            if (result.type === "compile") {
              return;
            }

            if (result.stdout) {
              emit({ type: "stdout", msg: result.stdout });
            }

            if (result.exit_code === 0) {
              emit({
                type: "stdout",
                msg: `\n-------------------------\n\nThe program executed successfully.\nDuration: ${result.duration}s\n\n\n`,
              });
            } else {
              emit({
                type: "stderr",
                msg: `\n-------------------------\n\nThe program failed to run.\nDuration: ${result.duration}s\nTimeout: ${Boolean(
                  result.timeout
                )}\nOut of Memory: ${Boolean(result.oom_killed)}\n\n\n`,
              });
            }
          })
          .catch((error) => {
            console.error("[WS RUN ERROR]", error);
            emit({
              type: "stderr",
              msg: "The code execution service is currently unavailable.",
            });
          })
          .finally(() => {
            runInFlight = false;
          });
        return;
      }

      if (data.type === "check") {
        if (!data.room || typeof data.room !== "string" || data.room.length > 100) {
          return emit({ type: "stderr", msg: "Missing room." });
        }
        if (!data.section || typeof data.section !== "string" || data.section.length > 100) {
          return emit({ type: "stderr", msg: "Missing section." });
        }

        const checkNow = Date.now();
        checkTimestamps = checkTimestamps.filter(
          (timestamp) => timestamp > checkNow - CHECK_WINDOW_MS
        );
        if (checkTimestamps.length >= CHECK_LIMIT_PER_WINDOW) {
          return emit({
            type: "stderr",
            msg: "Too many verification requests. Please wait a moment.",
          });
        }
        checkTimestamps.push(checkNow);

        emit({ type: "pending" });
        try {
          const freshUser = await authenticate.getUser({ _id: user._id }, ["rooms"]);
          if (!freshUser) {
            return emit({ type: "stderr", msg: "No user found." });
          }

          await check.verify({
            ...data,
            emit,
            user: freshUser,
          });
        } catch (error) {
          console.error("[WS CHECK ERROR]", error);
          emit({
            type: "stderr",
            msg: "Unable to verify your solution right now.",
          });
        }
        return;
      }

      if (data.type === "collab") {
        if (data.meta === "create") {
          const code = randomUUID();
          collabRooms[code] = {};
          collabRooms[code][id] = ws;
          room = code;
          return emit({ type: "collab", meta: "create", msg: code });
        }

        if (data.meta === "join") {
          if (!data.code) {
            return emit({
              type: "collab",
              meta: "error",
              msg: "Missing collab room code.",
            });
          }

          if (!validator.isUUID(data.code) || !collabRooms[data.code]) {
            return emit({
              type: "collab",
              meta: "error",
              msg: "Invalid collab room code.",
            });
          }

          if (room) {
            leave();
          }

          if (!collabRooms[data.code][id]) {
            room = data.code;
            collabRooms[data.code][id] = ws;
            emit({ type: "collab", meta: "please_update" }, false);
          }
          return;
        }

        if (data.meta === "leave") {
          leave();
          return;
        }

        if (data.meta === "update" && room && data.msg) {
          emit(
            {
              type: "collab",
              meta: "update",
              msg: data.msg,
              count: Object.keys(collabRooms[room]).length,
            },
            false
          );
        }
      }
    });

    ws.on("close", () => {
      leave();
    });
  });
};

export default { configure };
