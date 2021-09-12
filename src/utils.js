export const parseStringJSON = (string = "", defaultVal) => {
  if (!string || string?.length === 0) {
    return defaultVal;
  }
  try {
    return JSON.parse(string);
  } catch (_e) {
    return defaultVal;
  }
};

export const get = (url, { body, params, token, ...customConfig } = {}) => {
  const resourceUrl = new URL(url)
  const headers = { "Content-Type": "application/json" };
  const config = {
    method: "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
      Authorization: `Bearer ${token}`,
    },
  };
  if (params) {
    Object.keys(params).forEach(key => resourceUrl.searchParams.append(key, params[key]))
  }
  if (body) {
    config.body = JSON.stringify(body);
  }
  return window.fetch(resourceUrl, config).then(async (response) => {
    if (response.ok) {
      return await response.json();
    } else {
      let message = await response.text();
      if (response.status === 401) {
        message = "unauthorized"
      }      
      return Promise.reject(new Error(message));
    }
  });
};
