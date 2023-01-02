const express = require("express");
const authController = require("../controller/authController");
const authMiddleware = require("../middlewares/auth.middlewares");

const router = express.Router();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresherToken", authController.refresherToken);
router.post("/logout", authMiddleware.authenToken, authController.logout);
module.exports = router;
