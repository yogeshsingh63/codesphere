import response from "./response.js";

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function getAuthToken(req) {
  const header = req?.headers?.authorization;
  if (typeof header !== "string" || header.trim().length === 0) {
    return null;
  }

  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return header.trim();
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
  req.body = sanitizeMongoInput(req.body);
  req.query = sanitizeMongoInput(req.query);
  req.params = sanitizeMongoInput(req.params);
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

    if (recent.length >= max) {
      return res.status(429).json(response.failure(message));
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

function buildUserResponse(user) {
  return {
    email: user.email,
    username: user.username,
    name: user.name || "",
    bio: user.bio || "",
    profilepic: user.profilepic || null,
    storage: user.storage || [],
    size: user.size || 0,
    enrolled: user.enrolled || [],
    created: user.created || [],
    completed: user.completed || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export {
  asyncHandler,
  buildUserResponse,
  createRateLimiter,
  getAuthToken,
  requestLogger,
  requestSanitizer,
  sanitizeMongoInput,
};
