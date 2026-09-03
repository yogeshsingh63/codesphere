import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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

// Read once at boot instead of per request.
let APP_VERSION = "2.0.0";
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
  if (pkg?.version) APP_VERSION = pkg.version;
} catch {}

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Minimal security headers (avoid extra dep)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

sockets.configure(wss);

let mongoURI;
const mongoIP =
  process.env.MONGO_IP ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!mongoIP) {
  console.error(
    "[FATAL] No MongoDB connection string found. " +
      "Set MONGO_IP (or MONGO_URI / MONGODB_URI) in your environment variables."
  );
  process.exit(1);
}

if (mongoIP.startsWith("mongodb+srv") || mongoIP.startsWith("mongodb://")) {
  mongoURI = mongoIP;
} else if (process.env.MONGO_USER && process.env.MONGO_PASS) {
  mongoURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoIP}/${process.env.MONGO_DBNAME}`;
} else {
  mongoURI = `mongodb://${mongoIP}/${process.env.MONGO_DBNAME}`;
}

console.log(
  `[DB] Connecting to MongoDB at ${mongoURI.replace(/\/\/.*@/, "//***@")}...`
);

mongoose
  .connect(mongoURI)
  .then(() => console.log("[DB] Connected to MongoDB"))
  .catch((error) => console.error("[DB] MongoDB connection error:", error));

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

const writeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many requests. Please slow down.",
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
app.use(express.urlencoded({ extended: false, limit: "30mb" }));
app.use(express.json({ limit: "30mb" }));
app.use(requestSanitizer);

// Parse allowed origins from env (supports comma-separated list).
// Strip trailing slashes to avoid mismatch with browser-sent origins.
const allowedOrigins = (process.env.ORIGIN || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / same-origin requests (no origin header)
    if (!origin) return callback(null, true);

    // Normalize incoming origin (strip trailing slash just in case)
    const normalized = origin.replace(/\/+$/, "");

    // Localhost bypass only outside production
    if (process.env.NODE_ENV !== "production" && normalized.startsWith("http://localhost:")) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);
app.use("/user/update_pass", authLimiter);
app.use("/room/create", writeLimiter);
app.use("/room/edit", writeLimiter);
app.use("/room/delete", writeLimiter);
app.use("/room/join", writeLimiter);
app.use("/room/complete", writeLimiter);
app.use("/file/upload", writeLimiter);
app.use("/file/update", writeLimiter);
app.use("/file/delete", writeLimiter);
app.use("/file/del_folder", writeLimiter);
app.use("/file/new_folder", writeLimiter);

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/code", codeRouter);
app.use("/file", fileRouter);

app.get("/version", (req, res) => {
  res.json(response.success({ version: APP_VERSION }));
});

app.get("/", (req, res) => {
  res.send("CodeSphere API Server");
});

// Unknown routes speak JSON like everything else (not Express HTML).
app.use((req, res) => {
  return res.status(404).json(response.failure("Not found."));
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  if (res.headersSent) {
    return next(err);
  }

  if (err && (err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT")) {
    return res.status(413).json(response.failure("The file is too large."));
  }
  if (err && err.type === "entity.too.large") {
    return res.status(413).json(response.failure("Request body too large."));
  }
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json(response.failure("Malformed JSON body."));
  }
  if (err && err.message && err.message.includes("not allowed by CORS")) {
    return res.status(403).json(response.failure("Origin not allowed."));
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

    let token =
      requestUrl.searchParams.get("token") || request.headers.authorization;
    // Match HTTP semantics: allow "Bearer <token>" in the header.
    if (typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }
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

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
server.listen(PORT, () => {
  console.log(
    `[API] CodeSphere server listening at http://localhost:${PORT}`
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
