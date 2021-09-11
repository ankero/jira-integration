const CryptoJS = require("crypto-js");
const { BadRequest, InternalServerError } = require("http-errors");
const { createSecret, getSecret } = require("./secretManager")

const encryptToken = async (user, token) => {
  const secret = await createSecret(user);
  const cipher = CryptoJS.AES.encrypt(JSON.stringify(token), secret).toString();
  return cipher;
}

const decryptToken = async (user, cipher) => {
  const secret = await getSecret(user)

  if (!secret) {
    throw new BadRequest("no_encryption_key");
  }
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, secret);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    throw new InternalServerError()
  }
}

module.exports = {
  encryptToken, decryptToken
}