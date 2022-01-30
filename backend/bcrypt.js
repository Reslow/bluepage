const bcrypt = require("bcryptjs");
const saltRounds = 10;

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashedPassword);
  return hashedPassword;
}

async function comparePassword(password, hash) {
  const isTheSame = await bcrypt.compare(password, hash);
  console.log(isTheSame);
  return isTheSame;
}

async function checkPassword() {
  const hashPWD = await hashPassword();
  comparePassword(password, hashPWD);
}

exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;

module.exports = { hashPassword, comparePassword };
