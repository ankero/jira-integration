const fetch = require("node-fetch");
const {
  OAUTH_CALLBACK_URL,
  CLIENT_ID,
  BASE_URL,
  AUTH_BASE_URL,
  CLIENT_SECRET_KEY,
} = require("../constants");
const { getSecret } = require("./secretManager");

let secrets = {
  client_id: CLIENT_ID,
  client_secret: null
}

const exchangeCodeToToken = (code) => {
  const body = {
    code,
    grant_type: "authorization_code",
    redirect_uri: OAUTH_CALLBACK_URL,
    ...secrets
  };
  return fetch(`${AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error(JSON.stringify(data.error));
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
};

const useRefreshToken = async (user, auth) => {
  // TODO
};

const getAccessibleResources = async (auth) => {  
  const url = new URL(`${BASE_URL}/oauth/token/accessible-resources`);
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.accessToken}`, "Accept": "application/json", },
  };

  const response = await fetch(url, options);  
  const result = await response.json()  
  return result;
};

const initAtlassian = async () => {
  try {
    const clientSecret = await getSecret(CLIENT_SECRET_KEY)
    secrets.client_secret = clientSecret;
    console.log("[Atlassian] api keys ready");
  } catch (error) {
    throw error;
  }
}

module.exports = {
  initAtlassian,
  exchangeCodeToToken,
  getAccessibleResources
};