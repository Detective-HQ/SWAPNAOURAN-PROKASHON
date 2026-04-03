const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

const signFileToken = (payload) =>
  jwt.sign(payload, env.fileTokenSecret, { expiresIn: env.fileTokenExpiresIn });

const verifyFileToken = (token) => jwt.verify(token, env.fileTokenSecret);

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signFileToken,
  verifyFileToken
};
