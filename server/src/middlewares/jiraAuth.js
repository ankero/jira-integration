const { Unauthorized } = require("http-errors");
const { getToken } = require("../store");

const verifyJiraAuth = async (req, res, next) => {
  try {
    const { origin } = req.headers;
    const { user } = res.locals;

    if (!origin) {
      throw new Unauthorized("invalid_xrfs");
    }

    const { origin: savedOrigin, token } = await getToken(user, origin);

    if (!origin || !token) {
      throw new Unauthorized("authorization_missing");
    }

    if (savedOrigin !== origin) {
      throw new Unauthorized("invalid_xrfs");
    }

    const { access_token, refresh_token } = token || {};

    if (!access_token && !refresh_token) {
      throw new Unauthorized("authorization_missing");
    }

    res.locals.auth = {
      access_token,
      refresh_token
    };
    res.locals.origin = origin;

    next();
  } catch (error) {
    next(error)
  }
};

module.exports = { verifyJiraAuth };
