const { BadRequest } = require("http-errors");
const {
  CLIENT_ID,
  OAUTH_CALLBACK_URL,
  SCOPES,
  AUTH_BASE_URL,
} = require("../constants");
const { createStateToken } = require("../services/firestore");
const { verifySharedToken, createToken, createInternalToken } = require("../services/jwt");

/**
 * Callback of Zendesk OAuth process. Drawbridge does not authenticate the user because of custom domains.
 * So we use JWT token from query parameters instead for authentication
 *
 * @param {*} req
 * @param {*} res
 */
module.exports = async function oauthBegin(req, res) {
  const { token, origin } = req.query;

  if (!token) {
    throw new BadRequest("token_missing")
  }

  if (!origin) {
    throw new BadRequest("origin_missing")
  }

  // Verify token gotten from Happeo
  const user = verifySharedToken(token);

  // Create new token that is valid for only 2 mins
  const newToken = createInternalToken(user);

  const stateToken = await createStateToken({ token: newToken, origin });

  const authorize = new URL(`${AUTH_BASE_URL}/authorize`);
  authorize.searchParams.append("audience", "api.atlassian.com");
  authorize.searchParams.append("client_id", CLIENT_ID);
  authorize.searchParams.append("scope", SCOPES);
  authorize.searchParams.append("redirect_uri", OAUTH_CALLBACK_URL);
  authorize.searchParams.append("state", stateToken);
  authorize.searchParams.append("response_type", "code");
  authorize.searchParams.append("prompt", "consent");
  
  res.redirect(authorize);
};
