const CryptoJS = require("crypto-js");
const { BadRequest, InternalServerError } = require("http-errors");
const { createKeySymmetricEncryptDecrypt, getCryptoKey, encryptSymmetric, decryptSymmetric } = require("./kms");
const { createSecret, getSecret } = require("./secretManager")

const getKeyNameForOrganisation = user => `org_key_${user.organisationId || "generic"}`

const encryptToken = async (user, token) => {
  const keyName = getKeyNameForOrganisation(user)
  const cryptoKey = await getCryptoKey(keyName);
  console.log("CRYPTO KEY", cryptoKey)
  if (!cryptoKey) {
    await createKeySymmetricEncryptDecrypt(keyName)
  }
  const cipher = await encryptSymmetric(keyName, JSON.stringify(token))
  return cipher;

  // const secret = await createSecret(user);
  // const cipher = CryptoJS.AES.encrypt(JSON.stringify(token), secret).toString();
  // return cipher;
}

const decryptToken = async (user, cipher) => {
  try {
    const keyName = getKeyNameForOrganisation(user)
    const plaintext = await decryptSymmetric(keyName, cipher)  
    return JSON.parse(plaintext);
  } catch (error) {
    console.log(error);
    throw error;
  }
  

  // const secret = await getSecret(user)

  // if (!secret) {
  //   throw new BadRequest("no_encryption_key");
  // }
  // try {
  //   const bytes = CryptoJS.AES.decrypt(cipher, secret);
  //   const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  //   return decryptedData;
  // } catch (error) {
  //   throw new InternalServerError()
  // }
}

module.exports = {
  encryptToken, decryptToken
}