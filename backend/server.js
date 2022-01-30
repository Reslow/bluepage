const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const bcryptFunctions = require("./bcrypt");

const { admin, user } = require("./middleware/auth");

const {
  getAccountByUsername,
  getAccountByEmail,
  getAccountByCookie,
  createAccount,
  updateCookieOnAccount,
  removeByCookie,
  findAllByRole,
  updatePasswordOnAccount,
} = require("./database/operations");

app.use(express.static("../frontend"));
app.use(express.json());
app.use(cookieParser());

app.post("/api/signup", async (req, res) => {
  const credentials = req.body;
  console.log("---API/SIGNUP---");

  const responseObject = {
    success: true,
    usernameExists: false,
    emailExists: false,
  };

  const usernameExists = await getAccountByUsername(credentials.username);
  const emailExists = await getAccountByEmail(credentials.email);

  if (usernameExists.length > 0) {
    responseObject.usernameExists = true;
  }
  if (emailExists.length > 0) {
    responseObject.emailExists = true;
  }
  if (responseObject.usernameExists || responseObject.emailExists) {
    responseObject.success = false;
  } else {
    if (credentials.username == "anna") {
      credentials.role = "admin";
    } else {
      credentials.role = "user";
    }

    const hashedPasword = await bcryptFunctions.hashPassword(
      credentials.password
    );
    // sedan skriver över resultratet med hashat lösen till credentials
    credentials.password = hashedPasword;

    // om datan inte finns så vill vi pusha in credentials till databasen

    createAccount(credentials);
  }

  res.json(responseObject);
});

app.post("/api/login", async (req, res) => {
  console.log("---RUNNING LOGIN---");
  const credentials = req.body;

  let responseObject = {
    success: false,
  };

  const account = await getAccountByUsername(credentials.username);

  if (account.length > 0) {
    const correctPassword = await bcryptFunctions.comparePassword(
      credentials.password,
      account[0].password
    );
    console.log(correctPassword);
    if (correctPassword) {
      responseObject.success = true;

      const cookieId = Math.round(Math.random() * 10000);

      updateCookieOnAccount(credentials.username, cookieId);

      res.cookie("loggedIn", cookieId);
    }
  }

  res.json(responseObject);
});

app.get("/api/loggedin", async (req, res) => {
  const cookie = req.cookies.loggedIn;
  console.log("--/API/LOGGEDIN--");

  let responseObject = {
    loggedIn: false,
  };

  let account = await getAccountByCookie(cookie);
  console.log(account);

  if (account.length > 0) {
    console.log("account is true");
    responseObject.loggedIn = true;
  }

  res.json(responseObject);
});

app.get("/api/logout", (req, res) => {
  console.log("--/API/LOGOUT--");
  res.clearCookie("loggedIn");

  let responseObject = {
    success: "true",
  };
  res.json(responseObject);
});

app.get("/api/account", async (req, res) => {
  const cookie = req.cookies.loggedIn;

  const responseObject = {
    email: "",
    role: "",
  };

  let account = await getAccountByCookie(cookie);

  if (account.length > 0) {
    responseObject.email = account[0].email;
    responseObject.role = account[0].role;
  }

  res.json(responseObject);
});

app.get("/api/deleteAccount", user, (req, res) => {
  console.log("DELETEING API ACCOUNT");
  const cookie = req.cookies.loggedIn;

  const responseObject = {
    success: true,
  };

  removeByCookie(cookie);

  res.clearCookie("loggedIn");

  res.json(responseObject);
});

app.get("/api/userAccount", admin, async (req, res) => {
  const responseObject = {
    success: false,
    accounts: "",
  };

  const allusers = findAllByRole("user");
  console.log(allusers);
  console.log(userAccounts);

  if (userAccounts.length > 0) {
    responseObject.success = true;
    responseObject.accounts = userAccounts;
  }
  res.json(responseObject);
});

app.post("/api/changePassword", async (req, res) => {
  const newPassword = req.body;

  const cookie = req.cookies.loggedIn;

  const responseObject = {
    success: true,
  };

  const hashedPasword = await bcryptFunctions.hashPassword(
    newPassword.password
  );
  // sedan skriver över resultratet med hashat lösen till credentials
  newPassword.password = hashedPasword;

  updatePasswordOnAccount(cookie, newPassword.password);

  res.json(responseObject);
});

// listen on port 3000

app.listen(3000, () => {
  console.log("listen on port 3000");
});
