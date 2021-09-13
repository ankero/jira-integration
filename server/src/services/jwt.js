const jwt = require("jsonwebtoken");
const { SHARED_SECRET_KEY } = require("../constants");
const { createStateToken } = require("./firestore");
const { getSecret } = require("./secretManager");

let sharedSecret;

function createInternalToken(data) {
  return jwt.sign(data, sharedSecret, { expiresIn: "2min" });
}

function verifySharedToken(token) {
  try {
    const data = jwt.verify(token, sharedSecret);
    if (data.id) {
      return data;
    }

    return {
      id: data.user.id,
      organisationId: data.organisation.id,
    };
  } catch (error) {
    throw error;
  }
}

function generateStateToken(token, origin) {
  try {
    return createStateToken({
      token,
      origin,
    });
  } catch (error) {
    throw error;
  }
}

const initJWT = async () => {
  try {
    sharedSecret = await getSecret(SHARED_SECRET_KEY);
    console.log("[JWT] Shared secret ready");
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createInternalToken,
  verifySharedToken,
  generateStateToken,
  initJWT,
};
