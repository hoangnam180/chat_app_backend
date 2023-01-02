const bcrypt = require("bcryptjs");
const pool = require("../config/connectDatabase");

const checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM user WHERE user_name = '${userEmail}'`;
      let [user] = await pool.execute(sql);
      if (user.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

const handleUserLogin = (user_name, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(user_name);
      if (!isExist) {
        userData.errCode = 1;
        userData.errMessage = `Your's Email isn't exist in our system, plz try other email`;
        resolve(userData);
        return;
      }
      //user already exist
      const sql = `SELECT * FROM user WHERE user_name = '${user_name}'`;
      let [user] = await pool.execute(sql);
      if (user?.length <= 0) {
        userData.errCode = 2;
        userData.errMessage = `User not found`;
        resolve(userData);
        return;
      }
      // checkPass
      let checkPass = await bcrypt.compare(password, user[0].password);
      if (checkPass) {
        userData.errCode = 0;
        userData.errMessage = "OK";

        delete user[0].password;
        userData.user = user[0];
      } else {
        userData.errCode = 3;
        userData.errMessage = "Wrong password";
      }

      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

const handleUserRegister = (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      const { name, password, user_name, age } = body;
      let isExist = await checkUserEmail(user_name);
      if (!isExist) {
        const hashPassword = bcrypt.hashSync(password, 10);
        const sql = `INSERT INTO user(id, user_name, name, age, password) VALUES ('${null}','${user_name}','${name}','${age}','${hashPassword}')`;
        const result = await pool.execute(sql);
        userData.errCode = 0;
        userData.errMessage = `Ok`;
        userData.data = result;
      } else {
        userData.errCode = 2;
        userData.errMessage = `email này đã trùng với email trong hệ thống`;
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  handleUserLogin: handleUserLogin,
  handleUserRegister: handleUserRegister,
};
