const express = require("express");
const cookieParser = require("cookie-parser");
const nedb = require("nedb-promise");
const app = express();
const database = new nedb({ filename: "accounts.db", autoload: true });

const bcryptFunctions = require("./bcrypt");

app.use(express.static("../frontend"));
app.use(express.json());
app.use(cookieParser());

async function admin(req, res, next) {
  const cookie = req.cookies.loggedIn;
  console.log("I ADMIN MIDDLEWARE");

  try {
    const account = await database.find({ cookie: parseInt(cookie) });
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

// SIGNUP push credentials to account array

app.post("/api/signup", async (req, res) => {
  const credentials = req.body;
  console.log("---API/SIGNUP---");

  const responseObject = {
    success: true,
    usernameExists: false,
    emailExists: false,
  };

  const usernameExists = await database.find({
    username: credentials.username,
  });
  const emailExists = await database.find({ email: credentials.email });

  // find returnerar en array, om den inte hittar en match så returneras en tom array
  // console.log(emailExists);
  // console.log(usernameExists);

  // då en tom array returneras om ingen match så kollar vi om array-innehållet är mer än noll och sätter då värdet till true
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

    database.insert(credentials);
  }

  res.json(responseObject);
});

app.post("/api/login", async (req, res) => {
  console.log("---RUNNING LOGIN---");
  const credentials = req.body;

  let responseObject = {
    success: false,
  };

  const account = await database.find({ username: credentials.username });
  console.log({ credentials, account });

  if (account.length > 0) {
    const correctPassword = await bcryptFunctions.comparePassword(
      credentials.password,
      account[0].password
    );
    console.log(correctPassword);
    if (correctPassword) {
      responseObject.success = true;

      const cookieId = Math.round(Math.random() * 10000);

      database.update(
        { username: credentials.username },
        { $set: { cookie: cookieId } }
      );

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

  const account = await database.find({ cookie: parseInt(cookie) });

  if (account.length > 0) {
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
  const account = await database.find({ cookie: parseInt(cookie) });

  if (account.length > 0) {
    responseObject.email = account[0].email;
    responseObject.role = account[0].role;
  }

  res.json(responseObject);
});

app.get("/api/deleteAccount", admin, (req, res) => {
  console.log("DELETEING API ACCOUNT");
  const cookie = req.cookies.loggedIn;

  const responseObject = {
    success: true,
  };

  database.remove({ cookie: parseInt(cookie) });

  res.clearCookie("loggedIn");

  res.json(responseObject);
});

// when logout: check userCookie and remove cookie  then user should be redirected to startpage.

// check if loggedin, look at cookie if cookie is assigned

// Getting accountInfo

app.get("/api/userAccount", admin, async (req, res) => {
  const responseObject = {
    success: false,
    accounts: "",
  };

  //   mult:true för annars tar den första träffen endast och vi vill ha alla
  const userAccounts = database.find({ role: "user" }, { multi: true });

  if (userAccounts.length > 0) {
    responseObject.success = true;
    responseObject.accounts = userAccounts;
  }
  res.json(responseObject);
});

app.post("/api/changePassword", (req, res) => {
  const newPassword = req.body;

  const cookie = req.cookies.loggedIn;

  const responseObject = {
    success: true,
  };

  database.update(
    { cookie: parseInt(cookie) },
    { $set: { password: newPassword.password } }
  );

  res.json(responseObject);
});

// listen on port 3000

app.listen(3000, () => {
  console.log("listen on port 3000");
});
