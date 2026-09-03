import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import passport from "passport";

import User from "../models/User.js";
import File from "../models/File.js";
import authenticate from "../src/authenticate.js";

import response from "../src/response.js";
import { asyncHandler, authorNameMap, buildUserResponse, projectRoomsForClient } from "../src/http.js";

const router = express.Router();

router.get(
  "/count",
  asyncHandler(async (req, res) => {
    const count = await User.countDocuments({});
    return res.json(response.success({ count }));
  })
);

router.get(
  "/list",
  asyncHandler(async (req, res) => {
    const users = await User.find({}, "username").lean().exec();
    return res.json(response.success(users.map((user) => ({ username: user.username }))));
  })
);

router.get(
  "/info",
  asyncHandler(async (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string" || username.length < 6 || username.length > 64) {
      return res.json(
        response.failure("Username must be 6 characters at minimum.")
      );
    }

    const user = await authenticate.getUser({ username }, ["rooms"]);
    if (!user) {
      return res.json(response.failure("No user found with that username."));
    }

    return res.json(
      response.success({
        username: user.username,
        name: user.name || "",
        bio: user.bio || "",
        enrolled: user.enrolled.length,
        created: user.created.length,
        completed: user.completed.length,
        profilepic: user.profilepic,
      })
    );
  })
);

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

function validUsername(username) {
  return (
    typeof username === "string" &&
    username.length >= 6 &&
    username.length <= 30 &&
    USERNAME_RE.test(username)
  );
}

function validPassword(password) {
  // bcrypt silently truncates past 72 bytes; cap input to keep CPU bounded.
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 72
  );
}

function validEmail(email) {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    validator.isEmail(email)
  );
}

router.post(
  "/update_info",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const username = req.body.username;
    const user = req.user;

    if (!validUsername(username)) {
      return res.json(
        response.failure("Username must be 6-30 letters, numbers, or underscores.")
      );
    }

    if (user.username !== username) {
      if (await authenticate.getUser({ username })) {
        return res.json(
          response.failure("A user already exists with that username.")
        );
      }

      user.username = username;
    }

    if (typeof name === "string" && user.name !== name) {
      if (name.length > 30) {
        return res.json(response.failure("Name must be at most 30 characters."));
      }
      user.name = name;
    }

    // Only touch email when the client actually sends a new one.
    if (email !== undefined && user.email !== email) {
      if (!validEmail(email)) {
        return res.json(response.failure("Invalid email address."));
      }
      user.email = email;
    }

    await user.save();
    return res.json(response.success(authenticate.sign(user)));
  })
);

router.post(
  "/update_pass",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if (
      typeof currentPassword !== "string" ||
      currentPassword.length === 0 ||
      currentPassword.length > 72 ||
      !validPassword(newPassword)
    ) {
      return res.json(
        response.failure("Password must be 8-72 characters.")
      );
    }

    const user = await User.findById(req.user._id).select("+password").exec();
    if (!user) {
      return res.json(response.failure("User not found."));
    }
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.json(response.failure("Incorrect password."));
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json(response.success("Password changed successfully."));
  })
);

router.post(
  "/update_bio",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const bio = req.body.bio;
    if (typeof bio !== "string") {
      return res.json(response.failure("Bio must be a string."));
    }
    if (bio.length > 300) {
      return res.json(response.failure("Bio must be at most 300 characters."));
    }

    req.user.bio = bio;
    await req.user.save();

    return res.json(response.success("Bio changed successfully."));
  })
);

router.post(
  "/update_pic",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const code = req.body.code;
    const user = req.user;

    if (code === undefined || code === null || code === "") {
      user.profilepic = null;
      await user.save();
      return res.json(response.success("Profile picture removed."));
    }
    if (typeof code !== "string" || code.length > 100) {
      return res.json(response.failure("That file was not found."));
    }

    const count = await File.countDocuments({ code, owner: user._id });
    if (count === 0) {
      return res.json(response.failure("That file was not found."));
    }

    user.profilepic = code;
    await user.save();
    return res.json(response.success("Profile picture changed successfully."));
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!validUsername(username)) {
      return res.json(
        response.failure("Username must be 6-30 letters, numbers, or underscores.")
      );
    }
    if (!validPassword(password)) {
      return res.json(
        response.failure("Password must be 8-72 characters.")
      );
    }
    if (!validEmail(email)) {
      return res.json(response.failure("Invalid email address."));
    }

    const hash = await bcrypt.hash(password, 12);

    try {
      const user = await User.create({ username, password: hash, email });
      return res.json(response.success(authenticate.sign(user)));
    } catch (error) {
      console.log(error);
      return res.json(
        response.failure("A user already exists with that username or email.")
      );
    }
  })
);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("[LOGIN ERROR] Passport returned err:", err);
      return res.json(response.failure("There was an error signing in."));
    }
    if (!user) {
      console.error("[LOGIN ERROR] No user found/matched. Info:", info);
      return res.json(response.failure("Incorrect username or password."));
    }
    try {
      return res.json(response.success(authenticate.sign(user)));
    } catch (error) {
      console.error("[LOGIN ERROR] Failed to sign token:", error);
      return res.json(response.failure("There was an error signing in."));
    }
  })(req, res, next);
});

router.post("/auth", authenticate.requiresLogin, asyncHandler(async (req, res) => {
  return res.json(response.success(req.jwt));
}));

router.post(
  "/rooms",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    // Project to summaries only: full section docs would leak
    // flags, quiz answers and coding checks to enrolled members.
    const names = await authorNameMap(User, [...user.enrolled, ...user.created]);
    return res.json(response.success(projectRoomsForClient(user, names)));
  })
);

router.post(
  "/me",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    const names = await authorNameMap(User, [...user.enrolled, ...user.created]);
    return res.json(response.success(buildUserResponse(user, projectRoomsForClient(user, names))));
  })
);

export default router;
