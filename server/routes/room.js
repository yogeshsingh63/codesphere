import { randomUUID } from "crypto";
import express from "express";
import Ajv from "ajv";
import validator from "validator";

import Section from "../models/Section.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

import authenticate from "../src/authenticate.js";
import response from "../src/response.js";
import check from "../src/check.js";
import { asyncHandler } from "../src/http.js";

const router = express.Router();

const ajv = new Ajv({
  allErrors: true,
});

const SECTION_TYPES = ["info", "coding", "quiz", "flag", "website"];

const FILE_SCHEMA = {
  additionalProperties: false,
  required: ["filename", "code", "size"],
  type: "object",
  properties: {
    filename: { type: "string" },
    code: { type: "string" },
    size: { type: "number" },
  },
};

const STORAGE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["folder", "files"],
    properties: {
      folder: { type: "string" },
      files: {
        type: "array",
        items: FILE_SCHEMA,
      },
    },
  },
};

const ROOM_SCHEMA = {
  type: "object",
  title: "Room",
  required: ["title", "desc"],
  properties: {
    title: { type: "string", minLength: 3, maxLength: 30 },
    desc: { type: "string", minLength: 3, maxLength: 280 },
    sections: {
      type: "array",
      maxItems: 100,
      items: {
        additionalProperties: false,
        required: ["title", "type"],
        type: "object",
        properties: {
          title: { type: "string", minLength: 3, maxLength: 30 },
          type: { enum: SECTION_TYPES },
          layout: { type: "number" },
          code: { type: "string" },
          markdown: { type: "string", maxLength: 100000 },
          lang: { type: "string" },
          info: {
            type: "object",
            additionalProperties: false,
            properties: {
              image: FILE_SCHEMA,
            },
          },
            coding: {
            type: "object",
            additionalProperties: false,
            properties: {
              lang: { type: "string" },
              files: STORAGE_SCHEMA,
              checks: {
                type: "array",
                maxItems: 50,
                items: {
                  additionalProperties: false,
                  type: "object",
                  properties: {
                    stdin: { type: "string", maxLength: 20000 },
                    stdout: { type: "string", maxLength: 20000 },
                    code: { type: "string", maxLength: 5000 },
                    output: { type: "string", maxLength: 5000 },
                    multiline: { type: "boolean" },
                    fail: { type: "boolean" },
                    hint: { type: "string", maxLength: 1000 },
                  },
                },
              },
            },
          },
          quiz: {
            type: "object",
            additionalProperties: false,
            required: ["question"],
            properties: {
              question: { type: "string", maxLength: 2000 },
              answers: {
                type: "array",
                maxItems: 20,
                items: {
                  type: "object",
                  required: ["choice", "correct"],
                  additionalProperties: false,
                  properties: {
                    choice: { type: "string", maxLength: 500 },
                    correct: { type: "boolean" },
                  },
                },
              },
              all: { type: "boolean" },
            },
          },
          flag: { type: "string", maxLength: 500 },
          website: {
            type: "object",
            required: ["url"],
            additionalProperties: false,
            properties: {
              url: {
                type: "string",
                pattern:
                  "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$",
              },
              autopass: { type: "boolean" },
            },
          },
        },
      },
    },
    public: { type: "boolean" },
  },
  additionalProperties: false,
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get(
  "/count",
  asyncHandler(async (req, res) => {
    const count = await Room.countDocuments({});
    return res.json(response.success({ count }));
  })
);

router.post(
  "/create",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const roomData = req.body.roomData;
    const valid = ajv.validate(ROOM_SCHEMA, roomData);

    if (!valid) {
      return res.json(
        response.failure(
          "There was an error processing the data: " + ajv.errorsText()
        )
      );
    }
    const incomingSections = Array.isArray(roomData.sections) ? roomData.sections : [];

    try {
      const room = new Room({
        title: roomData.title,
        desc: roomData.desc,
        code: randomUUID(),
        author: req.user._id,
        public: roomData.public,
      });

      const sections = [];
      for (const sectionData of incomingSections) {
        const section = new Section({
          ...sectionData,
          code: randomUUID(),
          room: room._id,
        });
        await section.save();
        sections.push(section);
      }

      room.sections = sections.map((section) => section._id);
      await room.save();

      req.user.created.push(room._id);
      await req.user.save();

      return res.json(response.success("Room created successfully."));
    } catch (error) {
      console.log(error);
      return res.json(
        response.failure("There was an error saving your room. Please try again.")
      );
    }
  })
);

router.post(
  "/edit",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const roomData = req.body.roomData;
    const valid = ajv.validate(ROOM_SCHEMA, roomData);
    if (!valid) {
      return res.json(
        response.failure(
          "There was an error processing the data: " + ajv.errorsText()
        )
      );
    }

    const code = req.body.code;
    if (typeof code !== "string" || code.length > 100) {
      return res.json(response.failure("Missing room code."));
    }

    const incomingSections = Array.isArray(roomData.sections) ? roomData.sections : [];

    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    const ownedRoom = user.created.find((entry) => entry.code === code);
    if (!ownedRoom) {
      return res.json(response.failure("You do not have a room with that code."));
    }

    const room = await Room.findById(ownedRoom._id).populate("sections").exec();
    if (!room) {
      return res.json(response.failure("Unable to find that room."));
    }

    room.title = roomData.title;
    room.desc = roomData.desc;
    room.public = roomData.public;

    const updatedSections = [];
    for (const sectionData of incomingSections) {
      if (sectionData.code) {
        if (!validator.isUUID(sectionData.code)) {
          return res.json(response.failure("Invalid section code."));
        }

        const existingSection = room.sections.find(
          (section) => section.code === sectionData.code
        );
        if (!existingSection) {
          return res.json(response.failure("Invalid section code."));
        }

        existingSection.info = undefined;
        existingSection.coding = undefined;
        existingSection.quiz = undefined;
        existingSection.flag = undefined;
        existingSection.website = undefined;
        existingSection.set({
          ...sectionData,
          room: room._id,
        });
        await existingSection.save();
        updatedSections.push(existingSection);
      } else {
        const section = new Section({
          ...sectionData,
          code: randomUUID(),
          room: room._id,
        });
        await section.save();
        updatedSections.push(section);
      }
    }

    const removedSections = room.sections.filter(
      (existingSection) =>
        !updatedSections.find((section) => section.code === existingSection.code)
    );

    room.sections = updatedSections.map((section) => section._id);
    await room.save();

    if (removedSections.length > 0) {
      const removedCodes = removedSections.map((section) => section.code);
      const memberIds = [...new Set([String(room.author), ...room.members.map(String)])];
      const members = await User.find({ _id: { $in: memberIds } })
        .populate("completed.room")
        .populate("completed.sections")
        .exec();

      await Promise.all(
        members.map(async (member) => {
          let changed = false;

          for (const completion of member.completed) {
            if (completion.room?.code !== room.code) {
              continue;
            }

            const filteredSections = completion.sections.filter(
              (section) => !removedCodes.includes(section.code)
            );
            if (filteredSections.length !== completion.sections.length) {
              completion.sections = filteredSections.map((section) => section._id);
              changed = true;
            }
          }

          if (changed) {
            await member.save();
          }
        })
      );
    }

    if (removedSections.length > 0) {
      await Section.deleteMany({
        _id: { $in: removedSections.map((section) => section._id) },
      });
    }

    return res.json(response.success("Room updated successfully."));
  })
);

router.post(
  "/delete",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const code = req.body.code;
    if (typeof code !== "string" || code.length > 100) {
      return res.json(response.failure("Missing room code."));
    }

    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    const ownedRoom = user.created.find((entry) => entry.code === code);
    if (!ownedRoom) {
      return res.json(response.failure("You do not have a room with that code."));
    }

    const room = await Room.findById(ownedRoom._id).populate("sections").exec();
    if (!room) {
      return res.json(response.failure("Unable to find that room."));
    }

    const memberIds = [...new Set([String(room.author), ...room.members.map(String)])];
    await User.updateMany(
      { _id: { $in: memberIds } },
      {
        $pull: {
          enrolled: room._id,
          created: room._id,
          completed: { room: room._id },
        },
      }
    ).exec();

    await Section.deleteMany({
      _id: { $in: room.sections.map((section) => section._id) },
    }).exec();
    await Room.deleteOne({ _id: room._id }).exec();

    return res.json(response.success("Room deleted successfully."));
  })
);

router.post(
  "/info",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const code = req.body.code;
    if (!code || typeof code !== "string") {
      return res.json(response.failure("Missing code."));
    }

    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    const room = await Room.findOne({ code })
      .populate("sections")
      .populate("members")
      .populate("author")
      .exec();

    if (!room) {
      return res.json(response.failure("Unable to find room."));
    }

    const isMember =
      user.enrolled.some((entry) => entry.code === code) ||
      user.created.some((entry) => entry.code === code);
    if (!isMember && !room.public) {
      return res.json(response.failure("You are not in that room."));
    }

    await User.populate(room.members, [
      { path: "completed.room" },
      { path: "completed.sections" },
    ]);

    const clone = response.sanitize(room);
    if (!clone || !clone.author) {
      return res.json(response.failure("Unable to find room."));
    }
    clone.author = clone.author.username;

    const completed = (user.completed || []).find((entry) => entry?.room?.code === room.code);

    for (let index = 0; index < clone.sections.length; index += 1) {
      clone.sections[index].completed = Boolean(
        completed &&
          completed.sections.find(
            (section) => section.code === clone.sections[index].code
          )
      );
    }

    if (user.username !== clone.author) {
      clone.sections = response.sanitize(clone.sections, ["flag"]);
      for (const section of clone.sections) {
        if (section.type === "coding") {
          const checks = section.coding?.checks;
          section.coding = section.coding || {};
          section.coding.checks = Array.isArray(checks) ? checks.map(() => true) : [];
        }
        if (section.type === "quiz") {
          const answers = section.quiz?.answers;
          section.quiz = section.quiz || {};
          section.quiz.answers = Array.isArray(answers)
            ? answers.map((answer) => ({ choice: answer?.choice }))
            : [];
        }
      }
      delete clone.members;
    } else {
      clone.members = (clone.members || []).map((member) => ({
        username: member.username,
        completed: (member.completed || [])
          .filter((entry) => entry?.room?.code === code)[0]
          ?.sections?.map((section) => section.code),
      }));
    }

    clone.sections = response.sanitize(clone.sections, ["room"]);
    for (const section of clone.sections) {
      for (const type of SECTION_TYPES.filter((value) => value !== section.type)) {
        delete section[type];
      }
    }

    return res.json(response.success(clone));
  })
);

router.post(
  "/complete",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    if (!req.body.room || typeof req.body.room !== "string" || req.body.room.length > 100) {
      return res.json(response.failure("Missing room."));
    }
    if (!req.body.section || typeof req.body.section !== "string" || req.body.section.length > 100) {
      return res.json(response.failure("Missing section."));
    }

    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    const { room, section, answer, answers, flag, lang, files } = req.body ?? {};
    await check.verify({ user, res, room, section, answer, answers, flag, lang, files });
  })
);

router.post(
  "/join",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    if (!req.body.code || typeof req.body.code !== "string") {
      return res.json(response.failure("Missing room."));
    }

    const code = req.body.code;
    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);

    if (
      user.enrolled.find((room) => room.code === code) ||
      user.created.find((room) => room.code === code)
    ) {
      return res.json(response.failure("You are already in that room."));
    }

    const room = await Room.findOne({ code }).exec();
    if (!room) {
      return res.json(response.failure("Unable to find room."));
    }

    // Room codes are unguessable capability URLs: anyone holding the code
    // may join (this is how private rooms are shared). $addToSet keeps
    // concurrent joins from double-pushing.
    await Promise.all([
      User.updateOne({ _id: user._id }, { $addToSet: { enrolled: room._id } }).exec(),
      Room.updateOne({ _id: room._id }, { $addToSet: { members: user._id } }).exec(),
    ]);

    return res.json(response.success("You have successfully joined the room."));
  })
);

router.get(
  "/list",
  asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;
    const parsedPage = Math.max(Number.parseInt(page || "1", 10) || 1, 1);
    const parsedLimit = Math.min(
      Math.max(Number.parseInt(limit || "20", 10) || 20, 1),
      100
    );

    const query = { public: true };
    if (typeof search === "string" && search.trim().length > 0) {
      const term = search.trim().slice(0, 100);
      const regex = new RegExp(escapeRegex(term), "i");
      const authors = await User.find({ username: regex }, "_id").lean().exec();
      query.$or = [
        { title: regex },
        { desc: regex },
        { author: { $in: authors.map((author) => author._id) } },
      ];
    }

    const total = await Room.countDocuments(query);
    // Always paginate: an unbounded default would dump every public room.
    const findQuery = Room.find(query).populate("author").lean();
    findQuery.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);

    const docs = await findQuery.exec();
    const rooms = docs.map((room) => ({
      code: room.code,
      title: room.title,
      desc: room.desc,
      author: room.author?.username ?? "unknown",
    }));

    // Single consistent shape: always { rooms, pagination }
    return res.json(
      response.success({
        rooms,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.max(Math.ceil(total / parsedLimit), 1),
        },
      })
    );
  })
);

export default router;
