const fetch = require("node-fetch");
const {
  OAUTH_CALLBACK_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  SCOPES,
  BASE_URL,
  AUTH_BASE_URL,
} = require("../constants");

const exchangeCodeToToken = (code) => {
  // const url = new URL(`${AUTH_BASE_URL}/oauth/token`);
  const body = {
    code,
    grant_type: "authorization_code",
    redirect_uri: OAUTH_CALLBACK_URL,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
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

module.exports = {
  exchangeCodeToToken,
  getAccessibleResources
};
