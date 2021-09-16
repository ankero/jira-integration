const { Unauthorized, BadRequest } = require("http-errors");
const fetch = require("node-fetch");
const {
  OAUTH_CALLBACK_URL,
  CLIENT_ID,
  BASE_URL,
  AUTH_BASE_URL,
  CLIENT_SECRET_KEY,
} = require("../constants");
const { storeToken } = require("../store");
const { getSecret } = require("./secretManager");

let secrets = {
  client_id: CLIENT_ID,
  client_secret: null,
};

const exchangeCodeToToken = (code) => {
  const body = {
    code,
    grant_type: "authorization_code",
    redirect_uri: OAUTH_CALLBACK_URL,
    ...secrets,
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

const getNewToken = async ({ auth }) => {
  const body = {
    grant_type: "refresh_token",
    refresh_token: auth.refresh_token,
    ...secrets,
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

const useRefreshToken = async (locals) => {
  if (locals.refreshed) {
    throw new Unauthorized("retry_limit_exceeded");
  }

  try {
    console.log(`[Atlassian] Refreshing token for user ${locals.user.id}`);
    const token = await getNewToken(locals);
    await storeToken(locals.user, locals.origin, token);

    return {
      ...locals,
      auth: token,
      refreshed: true,
    };
  } catch (error) {
    console.error(`Unable to refresh token: ${error.message}`);
    if (error.message === "invalid_grant") {
      throw new Unauthorized(error.message);
    }
    throw error;
  }
};

const getAccessibleResources = async (locals) => {
  const { auth } = locals;

  const url = new URL(`${BASE_URL}/oauth/token/accessible-resources`);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      Accept: "application/json",
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();

  if (result.code === 401 && locals.auth.refresh_token) {
    const newLocals = await useRefreshToken(locals);
    return await getAccessibleResources(newLocals);
  }

  return result;
};

const getStatuses = async (locals, params) => {
  const { auth, project = {} } = locals;

  if (!params.resourceId && !project.projectId) {
    throw new BadRequest(
      "missing_parameter: 'resourceId' or prop.projectId not set",
    );
  }

  const url = new URL(
    `${BASE_URL}/ex/jira/${
      params.resourceId || project.projectId
    }/rest/api/3/status`,
  );

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      Accept: "application/json",
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();

  if (result.code === 401 && locals.auth.refresh_token) {
    const newLocals = await useRefreshToken(locals);
    return await searchWithJql(newLocals, params);
  }

  return result;
};

const searchSuggestions = async (locals, params) => {
  const { auth, project = {} } = locals;

  if (!params.resourceId && !project.projectId) {
    throw new BadRequest(
      "missing_parameter: 'resourceId' or prop.projectId not set",
    );
  }

  const url = new URL(
    `${BASE_URL}/ex/jira/${
      params.resourceId || project.projectId
    }/rest/api/3/issue/picker`,
  );

  url.searchParams.append("query", params.query || "");

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      Accept: "application/json",
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();

  if (result.code === 401 && locals.auth.refresh_token) {
    const newLocals = await useRefreshToken(locals);
    return await searchWithJql(newLocals, params);
  }

  return result;
};

const searchWithJql = async (locals, params) => {
  const { auth, project } = locals;

  if (!params.resourceId && !project.projectId) {
    throw new BadRequest(
      "missing_parameter: 'resourceId' or prop.projectId not set",
    );
  }

  const url = new URL(
    `${BASE_URL}/ex/jira/${
      params.resourceId || project.projectId
    }/rest/api/3/search`,
  );

  url.searchParams.append("jql", params.jql || "");
  url.searchParams.append("maxResults", params.maxResults || 10);
  url.searchParams.append("startAt", params.startAt || 0);

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      Accept: "application/json",
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();

  if (result.code === 401 && locals.auth.refresh_token) {
    const newLocals = await useRefreshToken(locals);
    return await searchWithJql(newLocals, params);
  }

  return result;
};

const initAtlassian = async () => {
  try {
    const clientSecret = await getSecret(CLIENT_SECRET_KEY);
    secrets.client_secret = clientSecret;
    console.log("[Atlassian] api keys ready");
  } catch (error) {
    throw error;
  }
};

module.exports = {
  initAtlassian,
  exchangeCodeToToken,
  getAccessibleResources,
  searchWithJql,
  searchSuggestions,
  getStatuses,
};
