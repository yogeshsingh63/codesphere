function success(response) {
	return {
		success: true,
		response: sanitize(response)
	}
}

function failure(response) {
	return {
		success: false,
		response: sanitize(response)
	}
}

const SENSITIVE_KEYS = new Set(["__v", "_id", "password"]);

function sanitize(obj, extraKeys = [], depth = 0) {
	if (depth > 10)
		return undefined;

	if (obj === null || obj === undefined) return obj;
	if (typeof obj !== "object") return obj;

	if (Array.isArray(obj)) {
		return obj.map((item) => sanitize(item, extraKeys, depth + 1)).filter((v) => v !== undefined);
	}

	// Avoid double-stringify loss: shallow-clone via structured path
	let clone;
	try {
		clone = JSON.parse(JSON.stringify(obj));
	} catch {
		return undefined;
	}

	const blocked = new Set([...SENSITIVE_KEYS, ...extraKeys]);
	for (const key of Object.keys(clone)) {
		if (blocked.has(key)) {
			delete clone[key];
		} else if (clone[key] && typeof clone[key] === "object") {
			const nested = sanitize(clone[key], extraKeys, depth + 1);
			if (nested === undefined) delete clone[key];
			else clone[key] = nested;
		}
	}
	return clone;
}

export default { success, failure, sanitize }