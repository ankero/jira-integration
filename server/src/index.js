const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const oauthBegin = require("./controllers/oauthBegin");
const asyncwrapper = require("./middlewares/asyncwrapper");
const { verifyJiraAuth } = require("./middlewares/jiraAuth");
const oauthCallback = require("./controllers/oauthCallback");
const {
  accessibleResources,
  search,
  suggestions,
} = require("./controllers/jira");
const { verifyHappeoAuth } = require("./middlewares/happeoAuth");
const { initKeyRing } = require("./services/kms");
const { initAtlassian } = require("./services/atlassian");
const { initJWT } = require("./services/jwt");
const projectSelector = require("./controllers/projectSelector");

Promise.all([initKeyRing(), initAtlassian(), initJWT()]).then(() => {
  const app = express();
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );

  app.set("view engine", "pug");

  app.get("/oauth/begin", asyncwrapper(oauthBegin));

  app.get("/oauth/callback", asyncwrapper(oauthCallback));

  app.get("/project-selector", asyncwrapper(projectSelector));

  app.get(
    "/api/accessible-resources",
    verifyHappeoAuth,
    verifyJiraAuth,
    asyncwrapper(accessibleResources),
  );

  app.get(
    "/api/search",
    verifyHappeoAuth,
    verifyJiraAuth,
    asyncwrapper(search),
  );

  app.get(
    "/api/suggestions",
    verifyHappeoAuth,
    verifyJiraAuth,
    asyncwrapper(suggestions),
  );

  app.use(function (_req, res, next) {
    res.set("Cache-control", "no-cache");
    next();
  });

  // Serve any static files
  app.use("/public", express.static(path.join(__dirname, "public")));

  app.get("/oauth/result", function (req, res) {
    const { success } = req.query;
    if (success === "true") {
      res.sendFile(path.join(__dirname, "./public/success.html"));
    } else {
      res.sendFile(path.join(__dirname, "./public/error.html"));
    }
  });

  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).send(err.message);
  });

  const port = process.env.PORT || 8081;
  app.listen(port, () => {
    console.log(`Custom widget example: listening on port ${port}`);
  });
});
