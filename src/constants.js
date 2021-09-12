export const SETTINGS_KEYS = {
  resourceId: "resourceId",
  jql: "jql",
};

export const WIDGET_SETTINGS = [
  {
    placeholder: "Select Jira site",
    key: SETTINGS_KEYS.resourceId,
    value: "",
    options: [{
      label: "Select value",
      value: null
    }],
    type: "dropdown",
  },
  {
    placeholder: "Max results",
    key: "maxResults",
    value: 10,
    minValue: 2,
    maxValue: 50,
    type: "number",
  },
  {
    placeholder: "Input JQL",
    key: SETTINGS_KEYS.jql,
    value: "",
    type: "text",
  },
  {
    placeholder: "What is JQL?",
    key: "jqlHelp",
    value: "https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/",
    type: "help-link",
  }
];

export const ORDER_BY_REGEX = /order by (\w+) (\w+)/mi;
