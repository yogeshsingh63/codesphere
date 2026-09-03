import response from "./response.js";

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function getAuthToken(req) {
  const header = req?.headers?.authorization;
  if (typeof header === "string" && header.trim().length > 0) {
    if (header.startsWith("Bearer ")) {
      return header.slice(7).trim();
    }

    return header.trim();
  }

  // Fallback for browser-driven requests that cannot set headers
  // (<img> tags, direct navigation). The cookie is SameSite=Lax and the
  // token is still fully verified; codes remain unguessable UUIDs.
  const cookieHeader = req?.headers?.cookie;
  if (typeof cookieHeader === "string") {
    const match = cookieHeader.match(/(?:^|;\s*)authToken=([^;]*)/);
    if (match) {
      try {
        return decodeURIComponent(match[1]).trim() || null;
      } catch {
        return match[1].trim() || null;
      }
    }
  }

  return null;
}

function sanitizeMongoInput(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeMongoInput);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value).reduce((cleaned, [key, nestedValue]) => {
    if (key.startsWith("$") || key.includes(".")) {
      return cleaned;
    }

    cleaned[key] = sanitizeMongoInput(nestedValue);
    return cleaned;
  }, {});
}

function requestSanitizer(req, res, next) {
  if (req.body && typeof req.body === "object") {
    const clean = sanitizeMongoInput(req.body);
    // Mutate in place: Express 4/5 exposes query/params as getters in some versions
    if (Array.isArray(req.body)) req.body.length = 0, req.body.push(...clean);
    else {
      for (const k of Object.keys(req.body)) delete req.body[k];
      Object.assign(req.body, clean);
    }
  }
  // query/params are getters in Express 5 — mutate properties instead of reassigning
  for (const container of [req.query, req.params]) {
    if (container && typeof container === "object") {
      const clean = sanitizeMongoInput(container);
      for (const k of Object.keys(container)) {
        if (!(k in clean)) delete container[k];
      }
      Object.assign(container, clean);
    }
  }
  next();
}

function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.log(
      `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
    );
  });

  next();
}

function createRateLimiter({
  windowMs,
  max,
  message,
  keyGenerator = (req) => req.ip || "unknown",
}) {
  const hits = new Map();

  return function rateLimiter(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    const existing = hits.get(key) || [];
    const recent = existing.filter((timestamp) => timestamp > windowStart);

    // Evict stale keys to avoid unbounded memory growth
    if (hits.size > 10000) {
      for (const [k, v] of hits) {
        if (!v.length || v[v.length - 1] <= windowStart) hits.delete(k);
        if (hits.size <= 5000) break;
      }
    }

    if (recent.length >= max) {
      const retryAfter = Math.ceil((recent[0] + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(retryAfter, 1)));
      return res.status(429).json(response.failure(message));
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

function sectionCodeOf(s) {
  if (!s) return "";
  if (typeof s === "string") return s;
  if (typeof s === "object") return s.code ?? String(s._id ?? "");
  return String(s);
}

function roomSummary(room, authorNames) {
  if (!room || typeof room !== "object") return null;
  const sections = Array.isArray(room.sections)
    ? room.sections.map((s) => ({ code: sectionCodeOf(s) }))
    : [];
  return {
    code: room.code ?? null,
    title: room.title ?? "",
    desc: room.desc ?? "",
    author: authorNames?.get(String(room.author)) ?? null,
    sections,
  };
}

function completionSummary(entry) {
  if (!entry || typeof entry !== "object") return null;
  const room = entry.room && typeof entry.room === "object"
    ? {
        code: entry.room.code ?? null,
        sections: Array.isArray(entry.room.sections)
          ? entry.room.sections.map((s) => ({ code: sectionCodeOf(s) }))
          : [],
      }
    : null;
  return {
    room,
    sections: Array.isArray(entry.sections)
      ? entry.sections.map((s) => ({ code: sectionCodeOf(s) }))
      : [],
  };
}

async function authorNameMap(UserModel, rooms) {
  const ids = [...new Set(
    (rooms || [])
      .map((r) => (r && r.author ? String(r.author) : ""))
      .filter((id) => id && !id.startsWith("[object"))
  )];
  const map = new Map();
  if (ids.length === 0) return map;
  // Already-username strings (populated docs) pass through.
  for (const room of rooms || []) {
    if (room && typeof room.author === "string" && !/^[a-f\d]{24}$/i.test(room.author)) {
      map.set(room.author, room.author);
    }
  }
  const objectIds = ids.filter((id) => /^[a-f\d]{24}$/i.test(id));
  if (objectIds.length === 0) return map;
  const users = await UserModel.find({ _id: { $in: objectIds } })
    .select("username")
    .lean()
    .exec();
  for (const u of users) map.set(String(u._id), u.username);
  return map;
}

function projectRoomsForClient(user, authorNames) {
  const enrolled = (user.enrolled || []).map((r) => roomSummary(r, authorNames)).filter(Boolean);
  const created = (user.created || []).map((r) => roomSummary(r, authorNames)).filter(Boolean);
  const completed = (user.completed || []).map(completionSummary).filter(Boolean);
  return { enrolled, created, completed };
}

function buildUserResponse(user, rooms) {
  return {
    email: user.email,
    username: user.username,
    name: user.name || "",
    bio: user.bio || "",
    profilepic: user.profilepic || null,
    storage: user.storage || [],
    size: user.size || 0,
    ...(rooms || { enrolled: [], created: [], completed: [] }),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export {
  asyncHandler,
  authorNameMap,
  buildUserResponse,
  createRateLimiter,
  getAuthToken,
  projectRoomsForClient,
  requestLogger,
  requestSanitizer,
  sanitizeMongoInput,
};
