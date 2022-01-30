const nedb = require("nedb-promise");
const database = new nedb({ filename: "accounts.db", autoload: true });

async function getAccountByUsername(username) {
  const account = await database.find({
    username: username,
  });

  return account;
}

async function getAccountByEmail(emailV) {
  const email = await database.find({ email: emailV });

  return email;
}

async function getAccountByCookie(cookie) {
  const account = await database.find({ cookie: parseInt(cookie) });
  console.log(account);
  return account;
}

async function createAccount(account) {
  database.insert(account);
}

async function updateCookieOnAccount(username, cookieId) {
  database.update({ username: username }, { $set: { cookie: cookieId } });
}

async function updatePasswordOnAccount(cookieId, newPassword) {
  database.update(
    { cookie: parseInt(cookieId) },
    { $set: { password: newPassword } }
  );
}

async function removeByCookie(cookieId) {
  database.remove({ cookie: parseInt(cookieId) });
}
async function findAllByRole(roleI) {
  const userAccounts = database.find({ role: roleI }, { multi: true });
  return userAccounts;
}

module.exports = {
  getAccountByUsername,
  getAccountByEmail,
  getAccountByCookie,
  createAccount,
  updateCookieOnAccount,
  updatePasswordOnAccount,
  findAllByRole,
  removeByCookie,
};
