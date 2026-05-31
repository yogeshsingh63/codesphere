import passport from "passport";
import local from "passport-local";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import response from "./response.js";
import { getAuthToken } from "./http.js";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new local.Strategy(
    {
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username }).exec();
        if (!user) {
          return done(null, false);
        }

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

function decode(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function sign(user) {
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
      isSignedIn: true,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 86400,
    }
  );
}

async function getUser(checks, populate = []) {
  let query = User.findOne(checks);

  if (populate.includes("rooms")) {
    query = query
      .populate({
        path: "enrolled",
        populate: {
          path: "sections",
        },
      })
      .populate({
        path: "created",
        populate: {
          path: "sections",
        },
      })
      .populate({
        path: "completed",
        populate: {
          path: "room sections",
        },
      });
  }

  return query.exec();
}

async function requiresLogin(req, res, next) {
  const token = getAuthToken(req);
  const decoded = decode(token);

  if (!decoded || !decoded.isSignedIn || !decoded.username) {
    return res.status(401).json(response.failure("You are not signed in!"));
  }

  try {
    const user = await getUser({ username: decoded.username });
    if (!user) {
      return res.status(401).json(response.failure("No user found!"));
    }

    req.jwt = decoded;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export default {
  sign,
  decode,
  requiresLogin,
  getUser,
};
