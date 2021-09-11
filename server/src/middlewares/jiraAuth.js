const { Unauthorized } = require("http-errors");
const { getToken } = require("../store");
const verifyJiraAuth = async (req, res, next) => {
  try {
    const { origin } = req.headers;
    const { user } = res.locals;

    const { origin: savedOrigin, token } = await getToken(user, origin);
    
    if (!origin || !token) {
      throw new Unauthorized("authorization_missing");
    }

    if (savedOrigin !== origin) {
      throw new Unauthorized("origin_mismatch");
    }

    const { access_token: accessToken, refresh_token: refreshToken } = token || {};
    
    if (!accessToken && !refreshToken) {
      throw new Unauthorized("authorization_missing");
    }

    res.locals.auth = {
      accessToken,
      refreshToken
    };

    next();
  } catch (e) {
    res.status(401).send();
  }
};

module.exports = { verifyJiraAuth };
