import { BASE_URL } from "./constants";
import { get } from "./utils";

export const getAccessibleResources = async (token) => {
  const { items } = await get(`${BASE_URL}/api/accessible-resources`, {
    token,
  });
  return items;
};

export const searchIssues = async (token, params) => {
  const { issues } = await get(`${BASE_URL}/api/search`, {
    params,
    token,
  });
  return issues;
};
