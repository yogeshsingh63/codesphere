import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import sockets from "./src/sockets.js";
import authenticate from "./src/authenticate.js";
import response from "./src/response.js";
import {
  createRateLimiter,
  requestLogger,
  requestSanitizer,
} from "./src/http.js";

import userRouter from "./routes/user.js";
import roomRouter from "./routes/room.js";
import codeRouter from "./routes/code.js";
import fileRouter from "./routes/file.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

sockets.configure(wss);

let mongoURI;
if (process.env.MONGO_IP && process.env.MONGO_IP.startsWith("mongodb+srv")) {
  mongoURI = process.env.MONGO_IP;
} else if (process.env.MONGO_USER && process.env.MONGO_PASS) {
  mongoURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_IP}/${process.env.MONGO_DBNAME}`;
} else {
  mongoURI = `mongodb://${process.env.MONGO_IP}/${process.env.MONGO_DBNAME}`;
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

let isShuttingDown = false;
let inFlightRequests = 0;
let resolveDrainedRequests = null;

function maybeResolveDrain() {
  if (isShuttingDown && inFlightRequests === 0 && resolveDrainedRequests) {
    resolveDrainedRequests();
    resolveDrainedRequests = null;
  }
}

function rejectSocket(socket, statusCode, message) {
  socket.write(
    `HTTP/1.1 ${statusCode} ${message}\r\n` +
      "Connection: close\r\n" +
      "Content-Type: text/plain\r\n" +
      `Content-Length: ${Buffer.byteLength(message)}\r\n` +
      "\r\n" +
      message
  );
  socket.destroy();
}

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
});

app.use((req, res, next) => {
  if (isShuttingDown) {
    return res
      .status(503)
      .json(response.failure("Server is shutting down. Please retry shortly."));
  }

  inFlightRequests += 1;
  res.on("finish", () => {
    inFlightRequests -= 1;
    maybeResolveDrain();
  });

  next();
});

app.use(requestLogger);
app.use(express.urlencoded({ extended: false, limit: "128mb" }));
app.use(express.json({ limit: "128mb" }));
app.use(requestSanitizer);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    return callback(null, process.env.ORIGIN);
  },
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/code", codeRouter);
app.use("/file", fileRouter);

app.get("/version", async (req, res) => {
  res.json({
    success: true,
    version: 1.0,
  });
});

app.get("/", (req, res) => {
  res.send("CodeSphere API Server");
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json(response.failure("Internal server error."));
});

server.on("upgrade", async (request, socket, head) => {
  try {
    if (isShuttingDown) {
      return rejectSocket(socket, 503, "Server shutting down");
    }

    const requestUrl = new URL(request.url, "http://localhost");
    if (requestUrl.pathname !== "/ws") {
      return socket.destroy();
    }

    const token =
      requestUrl.searchParams.get("token") || request.headers.authorization;
    const decoded = authenticate.decode(token);

    if (!decoded || !decoded.isSignedIn || !decoded.username) {
      return rejectSocket(socket, 401, "Unauthorized");
    }

    const user = await authenticate.getUser({ username: decoded.username });
    if (!user) {
      return rejectSocket(socket, 401, "Unauthorized");
    }

    request.user = user;
    request.jwt = decoded;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } catch (error) {
    console.error("[WS UPGRADE ERROR]", error);
    rejectSocket(socket, 500, "WebSocket upgrade failed");
  }
});

server.listen(process.env.PORT, () => {
  console.log(
    `[API] CodeSphere server listening at http://localhost:${process.env.PORT}`
  );
});

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`[API] ${signal} received. Shutting down gracefully.`);

  for (const client of wss.clients) {
    try {
      client.close(1001, "Server shutting down");
    } catch (error) {
      console.error("[WS CLOSE ERROR]", error);
    }
  }

  await new Promise((resolve) => {
    server.close(resolve);
  });

  if (inFlightRequests > 0) {
    await new Promise((resolve) => {
      resolveDrainedRequests = resolve;
      setTimeout(resolve, 10000).unref();
      maybeResolveDrain();
    });
  }

  await new Promise((resolve) => {
    wss.close(resolve);
  });

  await mongoose.connection.close(false);
  process.exit(0);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shutdown(signal).catch((error) => {
      console.error("[SHUTDOWN ERROR]", error);
      process.exit(1);
    });
  });
}
