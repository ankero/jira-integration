const { verifySharedToken } = require("../services/jwt");
const { exchangeCodeToToken } = require("../services/atlassian");
const { storeToken } = require("../services/store");
const { getStateTokenById } = require("../services/firestore");

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

    const authToken = await exchangeCodeToToken(code);

    // Store token to storage as encrypted string
    // Encryption key is generated per user
    // storeToken with initialSave set to true
    await storeToken(user, origin, authToken, true);
    console.log(`/project-selector?token=${token}&origin=${origin}`);
    res.redirect(`/project-selector?token=${token}&origin=${origin}`);
  } catch (err) {
    console.log(err);
    res.status(200).render("setup-failed");
  }
};
