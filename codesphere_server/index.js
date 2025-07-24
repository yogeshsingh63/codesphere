import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import http from "http";
import WebSocket from "ws";
import url from "url";

dotenv.config();
const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ noServer: true });
import sockets from "./src/sockets.js";
sockets.configure(wss);

import authenticate from "./src/authenticate.js";

import userRouter from "./routes/user.js";
import roomRouter from "./routes/room.js";
import codeRouter from "./routes/code.js";
import fileRouter from "./routes/file.js";

// 🔧 Build MongoDB URI without username/password for local
let mongoURI;
if (process.env.MONGO_IP && process.env.MONGO_IP.startsWith("mongodb+srv")) {
  mongoURI = process.env.MONGO_IP;
}
else if (process.env.MONGO_USER && process.env.MONGO_PASS) {
  mongoURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_IP}/${process.env.MONGO_DBNAME}`;
} else {
  mongoURI = `mongodb://${process.env.MONGO_IP}/${process.env.MONGO_DBNAME}`;
}

// 🔧 Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(bodyParser.urlencoded({ extended: false, limit: "128mb" }));
app.use(bodyParser.json({ limit: "128mb" }));

app.use(cors({
  origin: process.env.ORIGIN
}));
app.options("*", cors({
  origin: process.env.ORIGIN
}));

app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    req.jwt = authenticate.decode(token);
  }
  next();
});

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/code", codeRouter);
app.use("/file", fileRouter);

app.get("/version", async (req, res) => {
  res.json({
    success: true,
    version: 1.0
  });
});

app.get("/", (req, res) => {
  res.send("CodeSphere API Server");
});

server.on("upgrade", function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(process.env.PORT, () => {
  console.log(`[API] CodeSphere server listening at http://localhost:${process.env.PORT}`);
});
 