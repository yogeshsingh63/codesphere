import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import mime from "mime";

import authenticate from "../src/authenticate.js";
import response from "../src/response.js";
import File from "../models/File.js";
import { asyncHandler } from "../src/http.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

    if (req.file.buffer.length > 8 * 1024 * 1024) {
      return res.json(response.failure("The file is too large."));
    }

    const folder = typeof req.body.folder === "string" ? req.body.folder : "/";

    if (req.user.size + req.file.buffer.length > 128 * 1024 * 1024) {
      return res.json(
        response.failure("You have hit the max storage cap of 128MB.")
      );
    }

    const code = randomUUID();
    const item = await File.create({
      filename: req.file.originalname.replace(/\//g, ""),
      data: req.file.buffer,
      mimetype: req.file.mimetype,
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
    for (const folder of req.body.data) {
      if (!folder.folder || !folder.files || !Array.isArray(folder.files)) {
        return res.json(response.failure("Incorrect update format."));
      }

      for (const file of folder.files) {
        total += file.content.length;
        if (file.content.length >= 8 * 1024 * 1024) {
          return res.json(
            response.failure(
              `The file ${file.filename} is too large. Saving aborted.`
            )
          );
        }
      }
    }

    const existingFiles = await File.find({ owner: req.user._id }).exec();
    for (const file of existingFiles) {
      total += file.size;
    }

    if (total >= 128 * 1024 * 1024) {
      return res.json(
        response.failure("You have hit the max storage cap of 128MB.")
      );
    }

    for (const folder of req.body.data) {
      if (!req.user.storage.find((entry) => entry.folder === folder.folder)) {
        req.user.storage.push({ folder: folder.folder, files: [] });
      }
    }

    for (const folder of req.body.data) {
      const location = req.user.storage.find((entry) => entry.folder === folder.folder);
      for (const file of folder.files) {
        let code = randomUUID();
        if (file.code && location.files.find((entry) => entry.code === file.code)) {
          code = file.code;
          await File.deleteOne({ owner: req.user._id, code: file.code }).exec();
          location.files = location.files.filter((entry) => entry.code !== file.code);
        }

        location.files.push({
          filename: file.filename,
          code,
          size: file.content.length,
        });

        await File.create({
          filename: file.filename,
          data: Buffer.from(file.content),
          mimetype: mime.getType(file.filename) || "text/plain",
          code,
          size: file.content.length,
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

    let folder = req.body.folder;
    if (!folder.startsWith("/")) {
      folder = `/${folder}`;
    }

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

    const location = req.user.storage.find(
      (entry) => entry.folder === req.body.folder
    );
    if (!location) {
      return res.json(response.failure("Bad folder specified!"));
    }

    const file = location.files.find((entry) => entry.code === req.body.code);
    if (!file) {
      return res.json(response.failure("Bad file specified!"));
    }

    location.files = location.files.filter((entry) => entry.code !== req.body.code);
    await req.user.save();

    const deleteResult = await File.deleteOne({
      owner: req.user._id,
      code: req.body.code,
    }).exec();

    if (deleteResult.deletedCount === 0) {
      return res.json(response.failure("That file does not exist."));
    }

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

    const folders = req.user.storage.filter((entry) =>
      entry.folder.startsWith(req.body.folder)
    );
    const files = [];

    for (const folder of folders) {
      files.push(...folder.files.map((file) => file.code));
    }

    await File.deleteMany({ owner: req.user._id, code: { $in: files } }).exec();
    req.user.storage = req.user.storage.filter(
      (entry) => !entry.folder.startsWith(req.body.folder)
    );
    await req.user.save();

    return res.json(response.success("Folder successfully deleted."));
  })
);

router.get(
  "/:code",
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    if (!code || typeof code !== "string") {
      return res.json(response.failure("Invalid file."));
    }

    const file = await File.findOne({ code }).exec();
    if (!file) {
      return res.json(response.failure("Invalid file."));
    }

    res.writeHead(200, {
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        file.filename
      )}"`,
      "Content-Type": file.mimetype,
    });
    return res.end(file.data);
  })
);

export default router;
