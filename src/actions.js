import { get } from "./utils";

const API_URL = "https://jira-integration-huuhwkj6na-ew.a.run.app"

export const getAccessibleResources = async (token) => {
  const { items } = await get(`${API_URL}/accessible-resources`, { token });
  return items;
};

export const searchIssues = async (token, params) => {
  const { issues } = await get(`${API_URL}/search`, {
    params,
    token,
  });
  return issues;
};
