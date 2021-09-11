const jwt = require("jsonwebtoken");
const { createStateToken } = require("./firestore");

const SHARED_SECRET = process.env.SHARED_SECRET || "test";

function createInternalToken(data) {
  return jwt.sign(data, SHARED_SECRET, { expiresIn: "2min" });
}

function verifySharedToken(token) {
  try {    
    const data = jwt.verify(token, SHARED_SECRET);
    if (data.id) {
      return data;
    }

    return {
      id: data.user.id,
      organisationId: data.organisation.id
    }

  } catch (error) {
    throw error;
  }
}

function generateStateToken(token, origin) {
  try {
    return createStateToken({
      token,
      origin
    })

  } catch (error) {
    throw error;
  }
}

module.exports = {
  createInternalToken,
  verifySharedToken,
  generateStateToken
};
