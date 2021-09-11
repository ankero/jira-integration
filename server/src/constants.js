if (process.env.ENVIRONMENT !== "production") require("dotenv").config();

const BASE_URL = "https://api.atlassian.com";
const AUTH_BASE_URL = "https://auth.atlassian.com"

// Atlassian developer OAuth client id & secret
const CLIENT_ID = process.env.CLIENT_ID || "n1KOcR6G986BkCLr81dvjfT6iQ4pwFhR";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "HtCzUhRcHRN72yQheB-5LJnpF31led9let8SOWSYhZQECqXyurTKB9tuy7_S2osZ";

const SCOPES = "read:jira-user read:jira-work offline_access";

const SECRETS_PROJECT = "projects/happeo-jira-integration"

const OAUTH_CALLBACK_AFTER_REDIRECT_URL =
  process.env.OAUTH_CALLBACK_AFTER_REDIRECT_URL || "/oauth/result";

const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || "http://localhost:8081/oauth/callback";

module.exports = {
  BASE_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_CALLBACK_URL,
  SCOPES,
  OAUTH_CALLBACK_AFTER_REDIRECT_URL,
  AUTH_BASE_URL,
  SECRETS_PROJECT
};
