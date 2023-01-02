const jwt = require("jsonwebtoken");
const authenToken = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (data) {
      req.data = data;
      next();
    } else {
      return res.sendStatus(403);
    }
  });
};

module.exports = {
  authenToken,
};
