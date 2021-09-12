const CryptoJS = require("crypto-js");
const { BadRequest, InternalServerError } = require("http-errors");
const { createKeySymmetricEncryptDecrypt, getCryptoKey, encryptSymmetric, decryptSymmetric } = require("./kms");
const { createSecret, getSecret } = require("./secretManager")

const getKeyNameForOrganisation = user => `org_key_${user.organisationId || "generic"}`

const encryptToken = async (user, token) => {
  const keyName = getKeyNameForOrganisation(user)
  const cryptoKey = await getCryptoKey(keyName);  
  if (!cryptoKey) {
    await createKeySymmetricEncryptDecrypt(keyName)
  }
  return await encryptSymmetric(keyName, JSON.stringify(token))
}

const decryptToken = async (user, cipher) => {  
  try {    
    const keyName = getKeyNameForOrganisation(user)
    const plaintext = await decryptSymmetric(keyName, cipher)  
    return JSON.parse(plaintext)
  } catch (error) {
    throw error;
  }
}

module.exports = {
  encryptToken, decryptToken
}