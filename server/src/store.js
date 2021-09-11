const { encryptToken, decryptToken } = require("./services/encryption");
const { saveAuth, getAuth } = require("./services/firestore");

const storeToken = async (user, origin, token) => {
  const encryptedToken = await encryptToken(user, token);
  await saveAuth(user, origin, encryptedToken)
};

const getToken = async (user, incomingOrigin) => {
  const { auth, origin } = await getAuth(user, incomingOrigin)  
  const token = await decryptToken(user, auth);
  return { origin, token };
}

module.exports = { storeToken, getToken };
