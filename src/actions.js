import { BASE_URL } from "./constants";
import { get } from "./utils";

export const getAccessibleResources = async (token) => {
  const { items } = await get(`${BASE_URL}/api/accessible-resources`, {
    token,
  });
  return items;
};

export const searchIssues = async (token, params) => {
  const { issues, errors, errorMessages } = await get(
    `${BASE_URL}/api/search`,
    {
      params,
      token,
    },
  );

  if (errors || errorMessages) {
    throw new Error(errorMessages);
  }

  return issues;
};
