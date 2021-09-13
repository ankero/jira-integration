// Import the Secret Manager client and instantiate it:
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { SECRETS_PROJECT } = require("../constants");
const { NODE_ENV } = process.env;

const client = new SecretManagerServiceClient({
  ...(NODE_ENV === "local"
    ? {
        credentials: require("../../.secrets/service-account.json"),
      }
    : {}),
});

const getSecret = async (secretId) => {
  try {
    const [accessResponse] = await client.accessSecretVersion({
      name: `${SECRETS_PROJECT}/secrets/${secretId}/versions/latest`,
    });

    if (!accessResponse) {
      return null;
    }

    const responsePayload = accessResponse.payload.data.toString("utf8");

    return responsePayload;
  } catch (error) {
    return null;
  }
};

module.exports = {
  getSecret,
};
