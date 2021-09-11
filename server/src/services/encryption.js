const CryptoJS = require("crypto-js");
const { BadRequest } = require("http-errors");
const { createSecret, getSecret } = require("./secretManager")

const encryptToken = async (user, token) => {
  const secret = await createSecret(user);
  const base64Token = Buffer.from(JSON.stringify(token)).toString("base64");
  const cipherText = CryptoJS.AES.encrypt(base64Token, secret).toString();
  return cipherText;
}

const decryptToken = async (user, token) => {
  const secret = await getSecret(user)

  if (!secret) {
    throw new BadRequest("no_encryption_key");
  }

  const bytes = CryptoJS.AES.decrypt(token, secret);
  const base64Encoded = bytes.toString(CryptoJS.enc.Utf8);
  const originalText = Buffer.from(base64Encoded, 'base64')
  const parsed = JSON.parse(originalText);
  console.log(parsed);
  return parsed;
}

module.exports = {
  encryptToken, decryptToken
}