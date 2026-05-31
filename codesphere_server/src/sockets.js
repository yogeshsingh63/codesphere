import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
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

function safeSend(ws, data) {
  if (ws.readyState !== WebSocket.OPEN) {
    return false;
  }

  ws.send(JSON.stringify(data));
  return true;
}

const configure = (wss) => {
  wss.on("connection", (ws, request) => {
    const id = uuidv4();
    const user = request.user;
    let room = null;
    let runInFlight = false;
    let runTimestamps = [];

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
        if (!files || typeof files !== "object") {
          return emit({ type: "stderr", msg: "Missing files." });
        }
        if (!lang || typeof lang !== "string") {
          return emit({ type: "stderr", msg: "Missing language." });
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
        if (!data.room || typeof data.room !== "string") {
          return emit({ type: "stderr", msg: "Missing room." });
        }
        if (!data.section || typeof data.section !== "string") {
          return emit({ type: "stderr", msg: "Missing section." });
        }

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
          const code = uuidv4();
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
