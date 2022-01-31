const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const jwt = require("jsonwebtoken");

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
    token: "",
  };

  const account = await getAccountByUsername(credentials.username);

  if (account.length > 0) {
    const correctPassword = await bcryptFunctions.comparePassword(
      credentials.password,
      account[0].password
    );

    if (correctPassword) {
      responseObject.success = true;

      const token = jwt.sign({ username: account[0].username }, "a1b2c3", {
        expiresIn: 600,
      });
      responseObject.token = token;
    }
  }

  res.json(responseObject);
});

app.get("/api/loggedin", async (req, res) => {
  console.log("--/API/LOGGEDIN--");
  const token = req.headers.authorization.replace("Bearer ", "");

  let responseObject = {
    loggedIn: false,
  };

  try {
    const data = jwt.verify(token, "a1b2c3");
    console.log(data);
    // viktigt att andra argumenetet är samma säkerhetsträng som vid jwt.sign
    if (data) {
      responseObject.loggedIn = true;
    }
  } catch (error) {
    responseObject.message = "token has expired!!!";
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
  console.log("API ACCOUNT");
  const token = req.headers.authorization.replace(`Bearer `, "");
  const responseObject = {
    email: "",
    role: "",
  };

  try {
    const data = jwt.verify(token, "a1b2c3");
    let account = await getAccountByUsername(data.username);
    if (account.length > 0) {
      responseObject.email = account[0].email;
      responseObject.role = account[0].role;
    }
  } catch (error) {
    responseObject.message = "Token has expired!!";
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
