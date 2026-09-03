import express from "express";
import multer from "multer";
import validator from "validator";
import { randomUUID } from "crypto";
import mime from "mime";

import authenticate from "../src/authenticate.js";
import response from "../src/response.js";
import File from "../models/File.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Section from "../models/Section.js";
import { asyncHandler } from "../src/http.js";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_STORAGE_BYTES = 128 * 1024 * 1024;

function sanitizeFilename(name) {
  if (typeof name !== "string") return "";
  return name.replace(/[/\\]/g, "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200);
}

function safeMimeType(filename, claimed) {
  const fromName = mime.getType(filename);
  if (fromName && /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(fromName) && fromName.length <= 100) {
    return fromName;
  }
  if (typeof claimed === "string" && /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(claimed) && claimed.length <= 100) {
    return claimed;
  }
  return "application/octet-stream";
}

function normalizeFolder(input) {
  if (typeof input !== "string" || !input.trim()) return "/";
  let folder = input.trim();
  if (!folder.startsWith("/")) folder = `/${folder}`;
  folder = folder.replace(/\/{2,}/g, "/");
  if (folder.length > 1 && folder.endsWith("/")) folder = folder.slice(0, -1);
  // Block traversal
  if (folder.includes("..")) return "/";
  if (folder.length > 200) return folder.slice(0, 200);
  return folder;
}

function withTrailingSlash(folder) {
  return folder.endsWith("/") ? folder : `${folder}/`;
}

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

router.post(
  "/list",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    return res.json(response.success(req.user.storage));
  })
);

router.post(
  "/upload",
  [authenticate.requiresLogin, upload.single("file")],
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.json(response.failure("No file uploaded!"));
    }

    if (req.file.buffer.length > MAX_FILE_BYTES) {
      return res.json(response.failure("The file is too large."));
    }

    const folder = normalizeFolder(req.body.folder);

    if (req.user.size + req.file.buffer.length > MAX_STORAGE_BYTES) {
      return res.json(
        response.failure("You have hit the max storage cap of 128MB.")
      );
    }

    const filename = sanitizeFilename(req.file.originalname);
    if (!filename) {
      return res.json(response.failure("Invalid file name."));
    }

    const code = randomUUID();
    const item = await File.create({
      filename,
      data: req.file.buffer,
      mimetype: safeMimeType(filename, req.file.mimetype),
      code,
      size: req.file.buffer.length,
      owner: req.user._id,
    });

    let location = req.user.storage.find((entry) => entry.folder === folder);
    if (!location) {
      req.user.storage.push({ folder, files: [] });
      location = req.user.storage.find((entry) => entry.folder === folder);
    }

    location.files.push({
      filename: item.filename,
      code: item.code,
      size: item.size,
    });
    await req.user.save();

    return res.json(response.success("File uploaded successfully."));
  })
);

router.post(
  "/update",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    if (!req.body.data || !Array.isArray(req.body.data)) {
      return res.json(response.failure("No data to update!"));
    }

    let total = 0;
    const replacedCodes = new Set();
    for (const folder of req.body.data) {
      if (!folder.folder || typeof folder.folder !== "string" || !folder.files || !Array.isArray(folder.files)) {
        return res.json(response.failure("Incorrect update format."));
      }
      const normalized = normalizeFolder(folder.folder);
      if (normalized.length > 200 || folder.files.length > 200) {
        return res.json(response.failure("Too many files."));
      }

      for (const file of folder.files) {
        if (typeof file?.content !== "string" || typeof file?.filename !== "string") {
          return res.json(response.failure("Incorrect update format."));
        }
        const cleanName = sanitizeFilename(file.filename);
        if (!cleanName) {
          return res.json(response.failure("Incorrect update format."));
        }
        file.filename = cleanName;
        if (typeof file.code === "string" && file.code.length <= 100 && validator.isUUID(file.code)) {
          replacedCodes.add(file.code);
        } else {
          delete file.code;
        }
        const byteLength = Buffer.byteLength(file.content, "utf8");
        total += byteLength;
        if (byteLength > MAX_FILE_BYTES) {
          return res.json(
            response.failure(
              `The file ${file.filename} is too large. Saving aborted.`
            )
          );
        }
      }
    }

    const existingFiles = await File.find({ owner: req.user._id }).select("size code").lean().exec();
    for (const file of existingFiles) {
      // Files being overwritten are deleted below — don't double-count them.
      if (!replacedCodes.has(file.code)) {
        total += file.size;
      }
    }

    if (total > MAX_STORAGE_BYTES) {
      return res.json(
        response.failure("You have hit the max storage cap of 128MB.")
      );
    }

    for (const folder of req.body.data) {
      const normalized = normalizeFolder(folder.folder);
      if (!req.user.storage.find((entry) => entry.folder === normalized)) {
        req.user.storage.push({ folder: normalized, files: [] });
      }
    }

    for (const folder of req.body.data) {
      const normalized = normalizeFolder(folder.folder);
      const location = req.user.storage.find((entry) => entry.folder === normalized);
      for (const file of folder.files) {
        const byteLength = Buffer.byteLength(file.content, "utf8");
        let code = randomUUID();
        if (file.code && location.files.find((entry) => entry.code === file.code)) {
          code = file.code;
          await File.deleteOne({ owner: req.user._id, code: file.code }).exec();
          location.files = location.files.filter((entry) => entry.code !== file.code);
        }

        location.files.push({
          filename: file.filename,
          code,
          size: byteLength,
        });

        await File.create({
          filename: file.filename,
          data: Buffer.from(file.content, "utf8"),
          mimetype: safeMimeType(file.filename),
          code,
          size: byteLength,
          owner: req.user._id,
        });
      }
    }

    await req.user.save();
    return res.json(response.success("Files saved successfully!"));
  })
);

router.post(
  "/new_folder",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    if (!req.body.folder || typeof req.body.folder !== "string") {
      return res.json(response.failure("No folder name!"));
    }

    const folder = normalizeFolder(req.body.folder);

    if (!req.user.storage.find((entry) => entry.folder === folder)) {
      req.user.storage.push({ folder, files: [] });
      await req.user.save();
    }

    return res.json(response.success("Folder created successfully."));
  })
);

router.post(
  "/delete",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    if (!req.body.code || typeof req.body.code !== "string") {
      return res.json(response.failure("No file code specified!"));
    }
    if (!req.body.folder || typeof req.body.folder !== "string") {
      return res.json(response.failure("No folder specified!"));
    }

    const folder = normalizeFolder(req.body.folder);
    const location = req.user.storage.find(
      (entry) => entry.folder === folder
    );
    if (!location) {
      return res.json(response.failure("Bad folder specified!"));
    }

    const file = location.files.find((entry) => entry.code === req.body.code);
    if (!file) {
      return res.json(response.failure("Bad file specified!"));
    }

    const deleteResult = await File.deleteOne({
      owner: req.user._id,
      code: req.body.code,
    }).exec();

    if (deleteResult.deletedCount === 0) {
      return res.json(response.failure("That file does not exist."));
    }

    location.files = location.files.filter((entry) => entry.code !== req.body.code);
    await req.user.save();

    return res.json(response.success("File successfully deleted."));
  })
);

router.post(
  "/del_folder",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    if (!req.body.folder || typeof req.body.folder !== "string") {
      return res.json(response.failure("No folder specified!"));
    }

    const target = normalizeFolder(req.body.folder);
    if (target === "/") {
      return res.json(response.failure("Cannot delete the root folder."));
    }
    const prefix = withTrailingSlash(target);
    const isMatch = (folder) => folder === target || folder.startsWith(prefix);

    const folders = req.user.storage.filter((entry) =>
      isMatch(entry.folder)
    );
    const files = [];

    for (const folder of folders) {
      files.push(...folder.files.map((file) => file.code));
    }

    await File.deleteMany({ owner: req.user._id, code: { $in: files } }).exec();
    req.user.storage = req.user.storage.filter(
      (entry) => !isMatch(entry.folder)
    );
    await req.user.save();

    return res.json(response.success("Folder successfully deleted."));
  })
);

router.get(
  "/:code",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    if (!code || typeof code !== "string" || code.length > 100 || !validator.isUUID(code)) {
      return res.status(404).json(response.failure("Invalid file."));
    }

    const file = await File.findOne({ code }).exec();
    // Generic 404 either way so existence isn't leaked.
    if (!file) {
      return res.status(404).json(response.failure("Invalid file."));
    }

    const uid = String(req.user._id);
    let allowed = String(file.owner) === uid;
    if (!allowed) {
      const [isAvatar, section] = await Promise.all([
        User.countDocuments({ profilepic: code }).exec(),
        Section.findOne({
          $or: [{ "info.image.code": code }, { "coding.files.files.code": code }],
        })
          .select("room")
          .lean()
          .exec(),
      ]);
      if (isAvatar > 0) {
        allowed = true;
      } else if (section?.room) {
        const room = await Room.findById(section.room)
          .select("public members author")
          .lean()
          .exec();
        if (
          room &&
          (room.public ||
            String(room.author) === uid ||
            (Array.isArray(room.members) && room.members.some((m) => String(m) === uid)))
        ) {
          allowed = true;
        }
      }
    }
    if (!allowed) {
      return res.status(404).json(response.failure("Invalid file."));
    }

    // Mitigate stored XSS: only inert types render inline; everything
    // executable (svg/html/xml/...) forces a download.
    const safeInline = new Set([
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
    ]);
    const mimetype = safeMimeType(file.filename, file.mimetype);
    const disposition = safeInline.has(mimetype) ? "inline" : "attachment";

    res.writeHead(200, {
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
        file.filename
      )}"`,
      "Content-Type": mimetype,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
    });
    return res.end(file.data);
  })
);

export default router;
