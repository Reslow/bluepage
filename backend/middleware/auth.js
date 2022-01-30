const { getAccountByCookie } = require("../database/operations");

getAccountByCookie;

async function admin(req, res, next) {
  const cookie = req.cookies.loggedIn;
  console.log("I ADMIN MIDDLEWARE");

  try {
    getAccountByCookie(cookie);
    // om vi inte hittar ett anvädarkonto
    if (account.length == 0) {
      throw new Error();
    } else if (account[0].role == "admin") {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    const responseObject = {
      success: false,
      errorMessage: "unauthorized",
    };
    res.json(responseObject);
  }
}

// kolla att rollen är USER
async function user(req, res, next) {
  const cookie = req.cookies.loggedIn;
  console.log("I USER MIDDLEWARE");

  try {
    getAccountByCookie(cookie);
    // om vi inte hittar ett anvädarkonto
    if (account.length == 0) {
      throw new Error();
    } else if (account[0].role == "user") {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    const responseObject = {
      success: false,
      errorMessage: "unauthorized",
    };
    res.json(responseObject);
  }
}

module.exports = { admin, user };
