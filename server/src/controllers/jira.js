const {
  getAccessibleResources,
  searchWithJql,
  searchSuggestions,
} = require("../services/atlassian");

const accessibleResources = async (_req, res, next) => {
  try {
    const response = await getAccessibleResources(res.locals);
    res.send({ items: response });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await searchWithJql(res.locals, query);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

const suggestions = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await searchSuggestions(res.locals, query);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accessibleResources,
  search,
  suggestions,
};
