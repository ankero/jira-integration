const {
  createKeySymmetricEncryptDecrypt,
  getCryptoKey,
  encryptSymmetric,
  decryptSymmetric,
} = require("./kms");

const getKeyNameForOrganisation = (user) =>
  `org_key_${user.organisationId || "generic"}`;

const encryptToken = async (user, token) => {
  try {
    const keyName = getKeyNameForOrganisation(user);
    const cryptoKey = await getCryptoKey(keyName);
    if (!cryptoKey) {
      await createKeySymmetricEncryptDecrypt(keyName);
    }
    return await encryptSymmetric(keyName, JSON.stringify(token));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const decryptToken = async (user, cipher) => {
  try {
    const keyName = getKeyNameForOrganisation(user);
    const plaintext = await decryptSymmetric(keyName, cipher);
    return JSON.parse(plaintext);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  encryptToken,
  decryptToken,
};
