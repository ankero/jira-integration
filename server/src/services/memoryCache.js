const MEMORY_CACHE = {};

const getCacheKey = (user, origin = "") =>
  `${user.userId}_${Buffer.from(origin).toString("base64")}`;

const setAuthToCache = (user, origin, data) =>
  (MEMORY_CACHE[getCacheKey(user, origin)] = data);

const getAuthFromCache = (user, origin) =>
  MEMORY_CACHE[getCacheKey(user, origin)];

const clearAuthFromCache = (user, origin) =>
  (MEMORY_CACHE[getCacheKey(user, origin)] = null);

module.exports = {
  setAuthToCache,
  getAuthFromCache,
  clearAuthFromCache,
};
