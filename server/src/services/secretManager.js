// Import the Secret Manager client and instantiate it:
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const crypto = require("crypto")
const { SECRETS_PROJECT } = require('../constants');
const { NODE_ENV } = process.env

const client = new SecretManagerServiceClient({
  ...(NODE_ENV === "local" ? {
    credentials: require("../../.secrets/service-account.json")
  } : {})
});

const TTL_SECONDS = 3600 * 24 * 30

const getSecretIdForUser = user => `user_${user.id}_secret`

const createSecret = async (user) => {
  const secretId = getSecretIdForUser(user);
  const existingSecret = await getSecret(user)

  if (existingSecret) {
    return existingSecret;
  }

  const secretKey = crypto.randomBytes(64).toString("hex")
  const [secret] = await client.createSecret({
    parent: SECRETS_PROJECT,
    secretId,
    secret: {
      name: secretId,
      ttl: {
        seconds: TTL_SECONDS
      },
      replication: {
        automatic: {},
      },
    },

  });

  // Add a version with a payload onto the secret.
  await client.addSecretVersion({
    parent: secret.name,
    payload: {
      data: Buffer.from(secretKey, 'utf8'),
    },
  });

  return secretKey;
}

const getSecret = async (user) => {
  try {
    const secretId = getSecretIdForUser(user);
    const [accessResponse] = await client.accessSecretVersion({
      name: `${SECRETS_PROJECT}/secrets/${secretId}/versions/latest`,
    });

    if (!accessResponse) {
      return null;
    }

    const responsePayload = accessResponse.payload.data.toString('utf8');

    return responsePayload
  } catch (error) {
    return null;
  }

}

module.exports = {
  createSecret,
  getSecret
}