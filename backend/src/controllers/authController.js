const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { signAccessToken } = require("../utils/jwt");
const { sendSuccess } = require("../utils/response");

const buildAuthResponse = (user) => {
  const token = signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER"
    }
  });

  sendSuccess(res, 201, "Signup successful", buildAuthResponse(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  sendSuccess(res, 200, "Login successful", buildAuthResponse(user));
};

const getMe = async (req, res) => {
  sendSuccess(res, 200, "Profile fetched", {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
};

module.exports = {
  signup,
  login,
  getMe
};
