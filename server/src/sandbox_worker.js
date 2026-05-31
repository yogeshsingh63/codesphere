import Docker from "dockerode";
import Stream from "stream";
import tar from "tar-stream";
import streams from "memory-streams";
import { workerData, parentPort } from "worker_threads";

import sandbox from "./sandbox.js";

const docker = new Docker();

function packFiles(files) {
  const pack = tar.pack();
  const entries = [];

  for (const location of files) {
    for (const file of location.files) {
      entries.push([{ name: location.folder + file.filename }, file.content]);
    }
  }

  for (const entry of entries) {
    pack.entry(entry[0], entry[1]);
  }

  pack.finalize();
  return pack;
}

function formatExecutionError(message, error) {
  const details = error?.reason || error?.message || String(error || "");
  return `${message}${details ? `\n${details}` : ""}`;
}

async function safeRemoveContainer(container) {
  if (!container) {
    return;
  }

  try {
    await container.remove({ force: true });
  } catch (error) {
    if (error?.statusCode !== 404) {
      console.error("[SANDBOX REMOVE ERROR]", error);
    }
  }
}

async function createContainer(profileName, files) {
  const profile = sandbox.settings.profiles[profileName];
  const tarfile = packFiles(files);

  const opts = {
    Image: profile.image,
    User: profile.user,
    WorkingDir: "/sandbox",
    NetworkDisabled: true,
    HostConfig: {
      Memory: profile.limits.memory * 1000000,
      MemorySwap: profile.limits.memory * 1000000,
      NetworkMode: "none",
      PidsLimit: 1024,
      Ulimits: [
        { Name: "nofile", Soft: 1024, Hard: 2048 },
        {
          Name: "cpu",
          Soft: profile.limits.cputime,
          Hard: profile.limits.cputime,
        },
      ],
      AutoRemove: false,
    },
    Cmd: ["/bin/sh"],
    OpenStdin: true,
  };

  const container = await docker.createContainer(opts);
  await container.putArchive(tarfile, { path: "/sandbox" });
  await container.start();
  return container;
}

async function exec(container, cmd, stdin, timeout) {
  const output = new streams.WritableStream();
  const error = new streams.WritableStream();
  const results = {
    stdout: "",
    stderr: "",
    timeout: false,
    oom_killed: false,
    exit_code: 1,
  };

  const startedAt = Date.now();
  let finished = false;
  let timeoutId;

  const finalize = async (extras = {}) => {
    if (finished) {
      return null;
    }

    finished = true;
    clearTimeout(timeoutId);

    results.stdout = output.toString();
    results.stderr = error.toString();

    if (!results.stderr && results.stdout && results.stdout.includes("error")) {
      results.stderr = results.stdout;
      results.stdout = "";
    }

    try {
      const containerData = await container.inspect();
      results.oom_killed = Boolean(containerData?.State?.OOMKilled);
    } catch (inspectError) {
      results.oom_killed = false;
    }

    results.duration = ((Date.now() - startedAt) / 1000).toFixed(2);
    Object.assign(results, extras);
    return results;
  };

  try {
    const execution = await container.exec({
      Cmd: cmd,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: "/sandbox",
    });

    const stream = await execution.start({ hijack: true, stdin: true });
    container.modem.demuxStream(stream, output, error);

    const sender = new Stream.Readable({
      read() {},
    });
    sender.push(stdin);
    sender.push(null);
    sender.pipe(stream);

    return await new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        try {
          await container.kill();
        } catch (killError) {
          if (killError?.statusCode !== 304 && killError?.statusCode !== 404) {
            results.stderr = formatExecutionError(
              "Execution timed out and could not be terminated cleanly.",
              killError
            );
          }
        }

        resolve(
          await finalize({
            timeout: true,
            containerTerminated: true,
            exit_code: 1,
            stderr: results.stderr || "Execution timed out.",
          })
        );
      }, timeout * 1000);

      stream.on("error", async (streamError) => {
        resolve(
          await finalize({
            fatal: true,
            exit_code: 1,
            stderr: formatExecutionError(
              "Execution stream failed.",
              streamError
            ),
          })
        );
      });

      stream.on("end", async () => {
        let exitCode = 0;
        try {
          const data = await execution.inspect();
          exitCode = data?.ExitCode ?? 0;
        } catch (inspectError) {
          exitCode = 1;
        }

        resolve(
          await finalize({
            exit_code: exitCode,
          })
        );
      });
    });
  } catch (errorDuringExec) {
    return finalize({
      fatal: true,
      exit_code: 1,
      stderr: formatExecutionError("Unable to execute command.", errorDuringExec),
    });
  }
}

async function run(profileName, cmd, files, stdins = [""], callback, container) {
  const profile = sandbox.settings.profiles[profileName];
  const timeout =
    profile.limits.timeout ||
    profile.limits.cputime * sandbox.settings.CPU_TO_REAL_TIME_FACTOR;

  let activeContainer = container;

  if (!activeContainer) {
    try {
      activeContainer = await createContainer(profileName, files);
    } catch (error) {
      callback({
        type: profile.type,
        exit_code: 1,
        stderr: formatExecutionError(
          "Unable to prepare the execution sandbox.",
          error
        ),
      });
      return {
        container: null,
        shouldStop: true,
      };
    }
  }

  for (let index = 0; index < stdins.length; index += 1) {
    const result = await exec(activeContainer, cmd, stdins[index], timeout);
    callback({
      ...result,
      type: profile.type,
      stdinIndex: index,
    });

    if (
      result?.fatal ||
      result?.timeout ||
      result?.containerTerminated ||
      result?.oom_killed ||
      (profile.type === "compile" && result?.exit_code !== 0)
    ) {
      return {
        container: activeContainer,
        shouldStop: true,
      };
    }
  }

  return {
    container: activeContainer,
    shouldStop: false,
  };
}

(async () => {
  const callback = (data) => {
    parentPort.postMessage(data);
  };

  let container = null;

  try {
    for (let index = 0; index < workerData.length; index += 1) {
      const { profile, cmd, files, stdins } = workerData[index];
      const result = await run(profile, cmd, files, stdins, callback, container);
      container = result.container;

      if (result.shouldStop) {
        break;
      }
    }
  } catch (error) {
    callback({
      exit_code: 1,
      stderr: formatExecutionError("Sandbox worker failed.", error),
    });
  } finally {
    await safeRemoveContainer(container);
  }
})();
