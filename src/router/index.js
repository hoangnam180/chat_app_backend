const authRouter = require("./auth");
const siteRouter = require("./site");
const initWebRoute = (app) => {
  app.use("/", siteRouter);
  app.use("/api/v1/auth", authRouter);
};

module.exports = initWebRoute;
