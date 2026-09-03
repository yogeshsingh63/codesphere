import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateFile = (...parts) => fs.readFileSync(path.join(__dirname, "templates", ...parts)).toString();

const MAX_CONCURRENT_EXECUTIONS = Number.parseInt(
  process.env.SANDBOX_MAX_CONCURRENCY || "5",
  10
);
const MAX_QUEUED_EXECUTIONS = Number.parseInt(
  process.env.SANDBOX_MAX_QUEUE || "50",
  10
);

const executionQueue = [];
let activeExecutions = 0;

function enqueueExecution(executions, callback) {
  return new Promise((resolve, reject) => {
    if (executionQueue.length >= MAX_QUEUED_EXECUTIONS) {
      // Single busy signal via the normal callback path; resolve (don't
      // reject) so callers don't emit a second "unavailable" error.
      callback({
        exit_code: 1,
        stderr: "The code execution service is busy. Please try again shortly.",
      });
      resolve();
      return;
    }

    executionQueue.push({ executions, callback, resolve, reject });
    processQueue();
  });
}

function processQueue() {
  while (
    activeExecutions < MAX_CONCURRENT_EXECUTIONS &&
    executionQueue.length > 0
  ) {
    const job = executionQueue.shift();
    activeExecutions += 1;

    const worker = new Worker(new URL("./sandbox_worker.js", import.meta.url), {
      workerData: job.executions,
    });

    // Guard the slot: "error" doesn't always precede "exit", so decrement
    // at most once across both events.
    let slotReleased = false;
    const releaseSlot = () => {
      if (!slotReleased) {
        slotReleased = true;
        activeExecutions = Math.max(activeExecutions - 1, 0);
      }
      processQueue();
    };

    worker.on("message", (data) => {
      job.callback(data);
    });

    worker.on("error", (error) => {
      releaseSlot();
      job.reject(error);
    });

    worker.on("exit", (code) => {
      releaseSlot();
      if (code !== 0) {
        job.reject(new Error(`Sandbox worker exited with code ${code}`));
      } else {
        job.resolve();
      }
    });
  }
}

function cleanRunFiles(files) {
  // Defense in depth (WS layer already validates): drop entries that could
  // escape /sandbox when packed into the container tar.
  const locations = Array.isArray(files) ? files : Object.values(files || {});
  const cleaned = [];
  for (const location of locations) {
    if (!location || typeof location !== "object") continue;
    const folder = typeof location.folder === "string" ? location.folder : "/";
    const list = Array.isArray(location.files) ? location.files : [];
    const kept = [];
    for (const file of list) {
      if (!file || typeof file !== "object") continue;
      const name = typeof file.filename === "string" ? file.filename : "";
      const content = typeof file.content === "string" ? file.content : "";
      const joined = `${folder}${name}`;
      if (!name || /\.\.|[\u0000-\u001f\u007f]|^\//.test(joined)) continue;
      kept.push({ filename: name.slice(0, 200), content: content.slice(0, 512 * 1024) });
    }
    if (kept.length > 0) {
      cleaned.push({ folder, files: kept });
    }
    if (cleaned.length >= 50) break;
  }
  return cleaned;
}

async function runLang(lang, files, input = [""], callback) {
  const executions = [];
  const safeFiles = cleanRunFiles(files);

  if (lang === "python") {
    executions.push({
      profile: "python_run",
      cmd: ["python3", "main.py"],
      files: safeFiles,
      stdins: input,
    });
  } else if (lang === "node") {
    executions.push({
      profile: "node_run",
      cmd: ["node", "index.js"],
      files: safeFiles,
      stdins: input,
    });
  } else if (lang === "java") {
    executions.push({
      profile: "java_compile",
      cmd: ["javac", "Main.java"],
      files: safeFiles,
    });
    executions.push({
      profile: "java_run",
      cmd: ["java", "Main"],
      stdins: input,
    });
  } else if (lang === "c") {
    executions.push({
      profile: "gcc_compile",
      cmd: ["gcc", "main.c", "-o", "main"],
      files: safeFiles,
    });
    executions.push({
      profile: "gcc_run",
      cmd: ["./main"],
      stdins: input,
    });
  } else if (lang === "c++") {
    executions.push({
      profile: "gcc_compile",
      cmd: ["g++", "-pipe", "-O2", "-static", "-o", "main", "main.cpp"],
      files: safeFiles,
    });
    executions.push({
      profile: "gcc_run",
      cmd: ["./main"],
      stdins: input,
    });
  } else if (lang === "c#") {
    executions.push({
      profile: "mono_compile",
      cmd: ["csc", "main.cs"],
      files: safeFiles,
    });
    executions.push({
      profile: "mono_run",
      cmd: ["mono", "main.exe"],
      stdins: input,
    });
  } else if (lang === "rust") {
    executions.push({
      profile: "rust_compile",
      cmd: ["rustc", "main.rs", "-o", "main"],
      files: safeFiles,
    });
    executions.push({
      profile: "rust_run",
      cmd: ["./main"],
      stdins: input,
    });
  } else {
    callback({ exit_code: 1, stderr: "Invalid language." });
    return Promise.resolve();
  }

  return enqueueExecution(executions, callback);
}

const settings = {
  langs: [
    {
      lang: "python",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "main.py",
              content: templateFile("python", "main.py"),
            },
          ],
        },
      ],
      name: "Python 3.8.5",
    },
    {
      lang: "node",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "index.js",
              content: templateFile("node", "index.js"),
            },
            {
              filename: "input.js",
              content: templateFile("node", "input.js"),
            },
          ],
        },
      ],
      name: "NodeJS 10.13.0",
    },
    {
      lang: "java",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "Main.java",
              content: templateFile("java", "Main.java"),
            },
          ],
        },
      ],
      name: "Java 11",
    },
    {
      lang: "c",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "main.c",
              content: templateFile("c", "main.c"),
            },
          ],
        },
      ],
      name: "C",
    },
    {
      lang: "c++",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "main.cpp",
              content: templateFile("c++", "main.cpp"),
            },
          ],
        },
      ],
      name: "C++",
    },
    {
      lang: "c#",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "main.cs",
              content: templateFile("c#", "main.cs"),
            },
          ],
        },
      ],
      name: "C#",
    },
    {
      lang: "rust",
      template: [
        {
          folder: "/",
          files: [
            {
              filename: "main.rs",
              content: templateFile("rust", "main.rs"),
            },
          ],
        },
      ],
      name: "Rust",
    },
  ],
  profiles: {
    gcc_compile: {
      image: "stepik/epicbox-gcc:6.3.0",
      user: "root",
      limits: { cputime: 10, memory: 512 },
      type: "compile",
    },
    gcc_run: {
      image: "stepik/epicbox-gcc:6.3.0",
      user: "sandbox",
      limits: { cputime: 1, memory: 128 },
      type: "run",
    },
    mono_compile: {
      image: "stepik/epicbox-mono:5.0.0",
      user: "root",
      limits: { cputime: 10, memory: 512 },
      type: "compile",
    },
    mono_run: {
      image: "stepik/epicbox-mono:5.0.0",
      user: "sandbox",
      limits: { cputime: 1, memory: 128 },
      type: "run",
    },
    java_compile: {
      image: "stepik/epicbox-java:11.0.1",
      user: "root",
      limits: { cputime: 10, memory: 512 },
      type: "compile",
    },
    java_run: {
      image: "stepik/epicbox-java:11.0.1",
      user: "sandbox",
      limits: { cputime: 1, memory: 128 },
      type: "run",
    },
    node_run: {
      image: "strellic/epicbox-node:latest",
      user: "sandbox",
      limits: { cputime: 1, memory: 128 },
      type: "run",
    },
    python_run: {
      image: "strellic/epicbox-python:latest",
      user: "sandbox",
      limits: { cputime: 1, memory: 128 },
      type: "run",
    },
    rust_compile: {
      image: "strellic/rust-sandbox:latest",
      user: "sandbox",
      limits: { cputime: 10, memory: 512 },
      type: "compile",
    },
    rust_run: {
      image: "strellic/rust-sandbox:latest",
      user: "sandbox",
      limits: { cputime: 1, memory: 128 },
      type: "run",
    },
  },
  CPU_TO_REAL_TIME_FACTOR: 2,
};

export default { settings, runLang };
