const { verifySharedToken } = require("../services/jwt");
const { getAccessibleResources } = require("../services/atlassian");
const { OAUTH_CALLBACK_AFTER_REDIRECT_URL } = require("../constants");
const { Unauthorized, InternalServerError } = require("http-errors");
const { getToken } = require("../store");
const { saveProject } = require("../services/firestore");

/**
 * Callback of Zendesk OAuth process.
 *
 * @param {*} req
 * @param {*} res
 */
module.exports = async function oauthCallback(req, res) {
  const { token, origin, projectId, baseUrl } = req.query;
  const user = verifySharedToken(token);

  try {
    const auth = await getToken(user, origin);

    if (projectId && baseUrl) {
      await saveProject(user, origin, projectId, baseUrl);
    }

    const resources = await getAccessibleResources({ auth: auth.token });

    if (resources.code === 401) {
      throw new Unauthorized();
    }

    if (resources.code) {
      throw new InternalServerError();
    }

    const accessibleResources = resources.map((item) => ({
      ...item,
      selectUrl: `/project-selector?projectId=${item.id}&baseUrl=${item.url}&origin=${origin}&token=${token}`,
      selected: item.id === projectId,
    }));

    res.status(200).render("project-selector", {
      projectId,
      accessibleResources,
    });
  } catch (err) {
    console.log(err);
    res.status(200).render("setup-failed");
  }
};
