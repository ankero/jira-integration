const { encryptToken, decryptToken } = require("./services/encryption");
const { saveAuth, getAuth } = require("./services/firestore");

const IN_MEMORY_TOKEN_STORAGE = {};

const base64Origin = (origin) => Buffer.from(origin).toString("base64");

const getStorageId = (user, origin) => `${user.id}_${base64Origin(origin)}`;

const clearTokenForUser = (user, origin) => {
  const storageId = getStorageId(user, origin);
  IN_MEMORY_TOKEN_STORAGE[storageId] = null;
};

const storeToken = async (user, origin, token) => {
  const encryptedToken = await encryptToken(user, token);
  await saveAuth(user, origin, encryptedToken);
};

const getToken = async (user, incomingOrigin) => {
  const storageId = getStorageId(user, incomingOrigin);
  // if (IN_MEMORY_TOKEN_STORAGE[storageId]) {
  //   console.log("Got auth from memory");
  //   return IN_MEMORY_TOKEN_STORAGE[storageId];
  // }

  const now = Date.now();
  const { auth, origin, projectId, projectBaseUrl } = await getAuth(
    user,
    incomingOrigin,
  );
  console.log(`Getting auth took: ${Date.now() - now}ms`);
  const decryptNow = Date.now();
  const token = await decryptToken(user, auth);
  console.log(
    `Decrypting auth took: ${Date.now() - decryptNow}ms. Total ${
      Date.now() - now
    }ms.`,
  );

  const response = { origin, token, projectId, projectBaseUrl };

  // Set to memory
  IN_MEMORY_TOKEN_STORAGE[storageId] = response;

  return response;
};

module.exports = { storeToken, getToken, clearTokenForUser };
