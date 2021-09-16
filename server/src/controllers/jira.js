const {
  getAccessibleResources,
  searchWithJql,
  searchSuggestions,
  getStatuses,
} = require("../services/atlassian");

const getIssueStatuses = async (req, res, next) => {
  try {
    const { query } = req;
    const items = await getStatuses(locals, query);
    res.send({ items });
  } catch (error) {
    next(error);
  }
};

const accessibleResources = async (_req, res, next) => {
  try {
    const items = await getAccessibleResources(res.locals);
    res.send({ items });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await searchWithJql(res.locals, query);

    res.send({
      ...response,
      _project: res.locals.project,
    });
  } catch (error) {
    next(error);
  }
};

const suggestions = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await searchSuggestions(res.locals, query);

    let issueList = [];
    response.sections.forEach(({ issues }) => {
      issueList = [...issueList, ...issues];
    });

    const formattedList = issueList.map((issue) => ({
      id: issue.id,
      url: `${res.locals.project.projectBaseUrl}/browse/${issue.key}`,
      text: issue.summaryText,
      highlightedText: issue.summary,
      icon: `${res.locals.project.projectBaseUrl}${issue.img}`,
      subtitle: issue.key,
    }));

    res.send({
      items: [
        ...new Map(formattedList.map((item) => [item.id, item])).values(),
      ],
      _raw: response,
      _project: res.locals.project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIssueStatuses,
  accessibleResources,
  search,
  suggestions,
};
