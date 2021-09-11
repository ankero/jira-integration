const { encryptToken, decryptToken } = require("./services/encryption");
const { saveAuth, getAuth } = require("./services/firestore");

const storeToken = async (user, origin, token ) => {
  const encryptedToken = await encryptToken(user, token);
  console.log("Store token", encryptedToken)
  await saveAuth(user, origin, encryptedToken)
};

const getToken = async (user, origin) => {
  const data = await getAuth(user, origin)
  console.log(data)
  const decryptedToken = await decryptToken(user, data.encryptToken);
  console.log(decryptedToken)
  return decryptedToken
}

module.exports = { storeToken, getToken };
