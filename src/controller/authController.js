const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const authMiddleware = require('../middlewares/auth.middlewares');

const refreherTokens = [];
class AuthControllers {
  // [GET] REGISTER
  register = async (req, res) => {
    const body = req.body;
    if (!body) {
      return res.status(500).json({
        errCode: 1,
        message: 'Missing inputs parameter!',
      });
    }
    const userData = await userService.handleUserRegister(body);
    return res.status(200).json({
      errCode: userData?.errCode,
      message: userData?.errMessage,
      user: userData.user ? userData.user : {},
    });
  };

  login = async (req, res) => {
    const username = req.body?.username;
    const password = req.body?.password;
    if (!username || !password) {
      return res.status(500).json({
        errCode: 1,
        message: 'Missing inputs parameter!',
      });
    }
    const userData = await userService.handleUserLogin(username, password);
    if (!userData?.user)
      return res.status(500).json({
        errCode: userData.errCode,
        message: userData.errMessage,
      });
    const access_token = await jwt.sign(
      userData,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '30s',
      }
    );
    const refreherToken = await jwt.sign(
      userData,
      process.env.REFRESH_TOKEN_SECRET
    );
    refreherTokens.push(refreherToken);
    res.cookie('refreherToken', refreherToken, {
      signed: true,
    });
    return res.status(200).json({
      errCode: userData.errCode,
      message: userData.errMessage,
      user: userData.user ? userData.user : {},
      access_token,
      refreherToken,
    });
  };

  logout = (req, res) => {
    res.clearCookie('refreherToken');
    return res.status(204).json({
      message: 'successfully',
    });
  };

  refresherToken = async (req, res) => {
    const refreherToken = req.signedCookies.refreherToken;
    if (!refreherToken) return res.sendStatus(401);
    if (!refreherTokens.includes(refreherToken)) {
      return res.status(403);
    }
    await jwt.verify(
      refreherToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, data) => {
        if (err)
          return res.status(403).json({
            message: err,
          });
        const access_token = jwt.sign(
          { user: data?.user },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '30s',
          }
        );
        return res.status(200).json({
          user: data ? data : {},
          access_token,
        });
      }
    );
  };
}

module.exports = new AuthControllers();
