const { verifySharedToken } = require("../services/jwt");
const { exchangeCodeToToken } = require("../services/atlassian");
const { storeToken } = require("../store");
const { getStateTokenById } = require("../services/firestore");
const { OAUTH_CALLBACK_AFTER_REDIRECT_URL } = require("../constants");

/**
 * Callback of Zendesk OAuth process.
 *
 * @param {*} req
 * @param {*} res
 */
module.exports = async function oauthCallback(req, res) {
  const { code, state, error } = req.query;
  const { token, origin } = await getStateTokenById(state);
  const user = verifySharedToken(token);

  try {
    if (error) {
      res.status(400);
      return;
    }

    const token = await exchangeCodeToToken(code);

    // Store token to storage as encrypted string
    // Encryption key is generated per user
    await storeToken(user, origin, token);

    res.redirect(`${OAUTH_CALLBACK_AFTER_REDIRECT_URL}?success=true`);
  } catch (err) {
    console.log(err);
    res.redirect(`${OAUTH_CALLBACK_AFTER_REDIRECT_URL}?success=false`);
  }
};
