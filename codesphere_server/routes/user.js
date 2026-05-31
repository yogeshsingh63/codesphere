import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import passport from "passport";

import User from "../models/User.js";
import File from "../models/File.js";
import authenticate from "../src/authenticate.js";

import response from "../src/response.js";
import { asyncHandler, buildUserResponse } from "../src/http.js";

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
    if (typeof username !== "string" || username.length < 6) {
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

router.post(
  "/update_info",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const username = req.body.username;
    const user = req.user;

    if (typeof username !== "string" || username.length < 6) {
      return res.json(
        response.failure("Username must be 6 characters at minimum.")
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
      user.name = name;
    }

    if (user.email !== email) {
      if (typeof email !== "string" || !validator.isEmail(email)) {
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
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.json(
        response.failure("Password must be 8 characters at minimum.")
      );
    }

    const user = req.user;
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

    if (!code) {
      user.profilepic = null;
      await user.save();
      return res.json(response.success("Profile picture removed."));
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

    if (typeof username !== "string" || username.length < 6) {
      return res.json(
        response.failure("Username must be 6 characters at minimum.")
      );
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.json(
        response.failure("Password must be 8 characters at minimum.")
      );
    }
    if (typeof email !== "string" || !validator.isEmail(email)) {
      return res.json(response.failure("Invalid email address."));
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json(
        response.failure(
          "Username must consist of only letters, numbers, and underscores."
        )
      );
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
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.json(response.failure("There was an error signing in."));
    }
    if (!user) {
      return res.json(response.failure("Incorrect username or password."));
    }
    return res.json(response.success(authenticate.sign(user)));
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
    return res.json(
      response.success({
        enrolled: user.enrolled,
        created: user.created,
        completed: user.completed,
      })
    );
  })
);

router.post(
  "/me",
  authenticate.requiresLogin,
  asyncHandler(async (req, res) => {
    const user = await authenticate.getUser({ _id: req.user._id }, ["rooms"]);
    return res.json(response.success(buildUserResponse(user)));
  })
);

export default router;
