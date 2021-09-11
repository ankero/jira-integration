const {
  getAccessibleResources,
} = require("../services/atlassian");

const accessibleResources = async (req, res, next) => {
  try {
    const { auth } = res.locals;
    const response = await getAccessibleResources(auth)
    res.send({items: response})
  } catch (error) {
    throw error
  }
}


module.exports = {
  accessibleResources
};
