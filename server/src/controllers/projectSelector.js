const { verifySharedToken } = require("../services/jwt");
const { getAccessibleResources } = require("../services/atlassian");
const { Unauthorized, InternalServerError } = require("http-errors");
const { getToken } = require("../services/store");
const { saveProject } = require("../services/firestore");
const { sleep } = require("../services/utils");

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
      selected: item.id === projectId || resources.length === 1,
    }));

    const onlyOneProject = resources.length === 1;

    if (onlyOneProject) {
      const singleProject = resources[0];
      await saveProject(user, origin, singleProject.id, singleProject.url);
    }

    res.status(200).render("project-selector", {
      projectId: projectId || (onlyOneProject && resources[0].id),
      accessibleResources,
    });
  } catch (err) {
    console.log(err);
    res.status(200).render("setup-failed");
  }
};
