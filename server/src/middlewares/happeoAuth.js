const { verifySharedToken } = require("../services/jwt");

const verifyHappeoAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const user = verifySharedToken(token);

    console.log(
      `Request for userId:${user.id} organisationId:${user.organisationId}`,
    );

    res.locals.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyHappeoAuth };
