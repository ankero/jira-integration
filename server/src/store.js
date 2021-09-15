const { encryptToken, decryptToken } = require("./services/encryption");
const { saveAuth, getAuth } = require("./services/firestore");

const storeToken = async (user, origin, token) => {
  const encryptedToken = await encryptToken(user, token);
  await saveAuth(user, origin, encryptedToken);
};

const getToken = async (user, incomingOrigin) => {
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

  return response;
};

module.exports = { storeToken, getToken };
