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

  console.log(JSON.stringify(body))

  // Object.keys(params).forEach((key) =>
  //   url.searchParams.append(key, params[key]),
  // );
  return fetch(`${AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("RESPONSE")
      console.log(JSON.stringify(data))
      if (data.error) {
        throw new Error(JSON.stringify(data.error));
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
};

const getAuthorizedSites = async (accessToken) => {
  const url = new URL(`${BASE_URL}/oauth/token/accessible-resources`);
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "Accept": "application/json", },
  };

  const tickets = await fetch(url, options);
  return await tickets.json();
};

const createNewTicket = async (accessToken, input) => {
  const url = new URL(`${BASE_URL}/api/v2/tickets.json`);
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  };

  const newTicket = await fetch(url, options);
  return newTicket.json();
};

const fetchUserById = async (id, accessToken) => {
  const url = new URL(`${BASE_URL}/api/v2/users/${id}`);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const user = await fetch(url, options);
  return await user.json();
};

module.exports = {
  exchangeCodeToToken,
  getAuthorizedSites,
  createNewTicket,
  fetchUserById,
};
