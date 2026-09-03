import RE2 from "re2";

import Room from "../models/Room.js";

import sandbox from "./sandbox.js";
import response from "./response.js";

const trimmer = /^\s+|\s+$/g;

const compare = (input1 = "", input2 = "") => {
  return (
    input1 === input2 ||
    input1.replace(trimmer, "") === input2.replace(trimmer, "")
  );
};

const regexCompare = (regex, input, multiline = true, fail = false) => {
  try {
    const flags = multiline ? "m" : "";
    const matcher = new RE2(regex, flags);
    return matcher.test(input ?? "") === !fail;
  } catch {
    return fail === true;
  }
};

const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.code) return String(value.code);
    return "";
  }
  return String(value);
};

const complete = async (user, room, section) => {
  // Entries may hold populated docs OR bare ObjectIds (freshly pushed),
  // so compare by _id first and fall back to code.
  const roomId = String(room._id);
  let entry = user.completed.find((candidate) => {
    const rid = idOf(candidate.room);
    return rid !== "" && (rid === roomId || (room.code && rid === room.code));
  });
  if (!entry) {
    user.completed.push({ room: room._id, sections: [] });
    entry = user.completed[user.completed.length - 1];
  }

  const sectionId = String(section._id);
  const has = (entry.sections || []).some((item) => {
    const sid = idOf(item);
    return sid !== "" && (sid === sectionId || (section.code && sid === section.code));
  });
  if (!has) {
    entry.sections.push(section._id);
    await user.save();
  }
};

const coding = async (emit, user, room, section, lang, files) => {
  const checks = section.coding.checks;

  const testCases = checks.filter((item) => item.stdin || item.stdout);
  const codeChecks = checks.filter((item) => item.code || item.output);

  let stdins = testCases.map((item) => item.stdin);
  if (stdins.length === 0) {
    stdins = [""];
  }

  let passed = true;
  let failed = 0;
  let lastOutput = "";
  let compileFailed = false;
  let finalized = false;

  const failAndStop = (message) => {
    finalized = true;
    passed = false;
    emit({ type: "stderr", msg: message });
  };

  await sandbox.runLang(lang, files, stdins, async (result) => {
    if (finalized) {
      return;
    }

    if (result.type === "compile") {
      if (result.exit_code !== 0 || result.stderr) {
        compileFailed = true;
        failAndStop("There was an error compiling your code.\n\n");
        if (result.stderr) {
          emit({ type: "stderr", msg: result.stderr });
        }
      }
      return;
    }

    const index =
      typeof result.stdinIndex === "number" ? result.stdinIndex : 0;
    const testCase = testCases[index];
    lastOutput = result.stdout || "";

    if (testCase) {
      if (
        result.exit_code === 0 &&
        !result.stderr &&
        compare(result.stdout, testCase.stdout)
      ) {
        emit({
          type: "stdout",
          msg: `[Task] Passed test case ${index + 1} / ${checks.length}.\n`,
        });
      } else {
        passed = false;
        failed += 1;
        emit({
          type: "stderr",
          msg: `[Task] Failed test case ${index + 1} / ${checks.length}.\n`,
        });
        if (testCase.hint) {
          emit({ type: "stderr", msg: `[Task]\t\t${testCase.hint}\n` });
        }
        if (result.stderr) {
          emit({ type: "stderr", msg: result.stderr });
        }
      }
    }

    if (result.timeout || result.oom_killed) {
      finalized = true;
      passed = false;
      emit({
        type: "stderr",
        msg: `\n${section.title} failed.\nExecution stopped before all checks completed.`,
      });
      return;
    }

    const completedRunCount = index + 1;
    if (completedRunCount !== testCases.length) {
      return;
    }

    for (let checkIndex = 0; checkIndex < codeChecks.length; checkIndex += 1) {
      const codeCheck = codeChecks[checkIndex];
      let okay = true;
      const code = files?.[0]?.files?.[0]?.content || "";

      if (codeCheck.code) {
        if (
          !regexCompare(codeCheck.code, code, codeCheck.multiline, codeCheck.fail)
        ) {
          okay = false;
        }
      }

      if (codeCheck.output) {
        if (
          !regexCompare(
            codeCheck.output,
            lastOutput,
            codeCheck.multiline,
            codeCheck.fail
          )
        ) {
          okay = false;
        }
      }

      if (!okay) {
        passed = false;
        failed += 1;
        emit({
          type: "stderr",
          msg: `[Task] Failed check ${completedRunCount + checkIndex + 1} / ${checks.length}.\n`,
        });
        if (codeCheck.hint) {
          emit({ type: "stderr", msg: `[Task]\t\t${codeCheck.hint}\n` });
        }
      } else {
        emit({
          type: "stdout",
          msg: `[Task] Passed check ${completedRunCount + checkIndex + 1} / ${checks.length}.\n`,
        });
      }
    }

    finalized = true;
    if (passed) {
      emit({ type: "stdout", msg: "\nNice job! You passed all of the checks." });
      emit({ type: "completed" });
      await complete(user, room, section);
      return;
    }

    emit({
      type: "stderr",
      msg: `\n${section.title} failed.\n${failed} / ${checks.length} checks failed.`,
    });
  });

  if (!finalized && compileFailed) {
    return;
  }
};

const verify = async ({
  emit,
  res,
  user,
  room,
  section,
  lang,
  files,
  answer,
  answers,
  flag,
}) => {
  let find;
  if (user.enrolled.find((entry) => entry.code === room)) {
    find = user.enrolled.find((entry) => entry.code === room);
  }
  if (user.created.find((entry) => entry.code === room)) {
    find = user.created.find((entry) => entry.code === room);
  }

  const error = (message) => {
    if (emit) {
      return emit({ type: "stderr", msg: message });
    }

    return res.json(response.failure(message));
  };

  const success = (message) => {
    if (emit) {
      return emit({ type: "stdout", msg: message });
    }

    return res.json(response.success(message));
  };

  if (!find) {
    return error("You are not in that room.");
  }

  const fullRoom = await Room.findOne({ code: find.code }).populate("sections").exec();
  if (!fullRoom) {
    return error("Unable to find room.");
  }

  if (!fullRoom.sections.find((entry) => entry.code === section)) {
    return error("That section does not exist.");
  }

  const targetSection = fullRoom.sections.find((entry) => entry.code === section);

  if (targetSection.type === "coding" && targetSection.coding.checks.length > 0) {
    if (!emit) {
      return error("Coding verification requires a WebSocket connection.");
    }
    if (!lang || typeof lang !== "string") {
      return error("Missing lang.");
    }
    if (!files || typeof files !== "object") {
      return error("Missing files.");
    }

    return coding(emit, user, fullRoom, targetSection, lang, files);
  }

  if (
    targetSection.type === "info" ||
    (targetSection.type === "coding" && targetSection.coding.checks.length === 0) ||
    targetSection.type === "website"
  ) {
    await complete(user, fullRoom, targetSection);
    return success("Section completed!");
  }

  if (targetSection.type === "quiz") {
    const correct = targetSection.quiz.answers
      .filter((item) => item.correct)
      .map((item) => item.choice);

    if (targetSection.quiz.all) {
      if (
        Array.isArray(answers) &&
        JSON.stringify(correct.sort()) === JSON.stringify([...answers].sort())
      ) {
        await complete(user, fullRoom, targetSection);
        return success("Section completed!");
      }
    } else if ((correct.length === 0 && !answer) || correct.includes(answer)) {
      await complete(user, fullRoom, targetSection);
      return success("Section completed!");
    }

    return error("Incorrect answer!");
  }

  if (targetSection.type === "flag") {
    if (targetSection.flag === flag) {
      await complete(user, fullRoom, targetSection);
      return success("Section completed!");
    }
    return error("Incorrect answer!");
  }

  return error("Section type not implemented!");
};

export default { verify };
