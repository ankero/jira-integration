const {
  getAccessibleResources,
  searchWithJql,
  searchSuggestions,
  getStatuses,
} = require("../services/atlassian");

const LOCAL_STATUS_CACHE = {};

const getIssueStatuses = async (locals) => {
  try {
    if (LOCAL_STATUS_CACHE[locals.project.projectId]) {
      return LOCAL_STATUS_CACHE[locals.project.projectId];
    }
    const statusList = await getStatuses(locals);
    LOCAL_STATUS_CACHE[locals.project.projectId] = statusList;
    return statusList;
  } catch (error) {
    console.log(
      `Unable to list statuses for project: ${locals.project.projectId}. Err: ${error.message}`,
    );
    return [];
  }
};

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
    const statuses = await getIssueStatuses(res.locals, query);

    if (response.issues) {
      response.issues = response.issues.map((issue) => ({
        ...issue,
        fields: {
          ...issue.fields,
          status: {
            ...issue.fields.status,
            _status: statuses.find(({ id }) => id === issue.fields.status.id),
          },
        },
      }));
    }

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
  accessibleResources,
  search,
  suggestions,
};
