const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { clerkMiddleware } = require("@clerk/express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const env = require("../config/env");

/**
 * Updated to use the new Clerk API
 * clerkMiddleware() parses the auth token
 * req.auth() returns the auth object (replaces deprecated req.auth property)
 */
const mapClerkUser = async (req, res, next) => {
  try {
    // Get auth using Clerk's request helper.
    const auth = typeof req.auth === "function" ? req.auth() : req.auth;
    
    if (!auth || !auth.userId) {
      return next(new ApiError(401, "Unauthorized - No valid authentication token"));
    }

    const clerkId = auth.userId;
    const sessionClaims = auth.sessionClaims || {};
    const emailFromClaims =
      sessionClaims.email ||
      sessionClaims.email_address ||
      sessionClaims.primaryEmail ||
      null;
    const firstName = sessionClaims.given_name || "";
    const lastName = sessionClaims.family_name || "";
    const fullNameFromClaims = sessionClaims.name || `${firstName} ${lastName}`.trim();

    // Try by Clerk ID first.
    let user = await prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, email: true, role: true, name: true }
    });

    // Fallback: if local account already exists with same email, use it.
    if (!user && emailFromClaims) {
      user = await prisma.user.findUnique({
        where: { email: emailFromClaims },
        select: { id: true, email: true, role: true, name: true }
      });
    }

    if (!user) {
      const provisionedEmail = emailFromClaims || `${clerkId}@clerk.local`;
      const provisionedName = fullNameFromClaims || `Clerk User ${clerkId.slice(-6)}`;
      const placeholderPassword = await bcrypt.hash(
        `clerk:${crypto.randomUUID()}`,
        env.bcryptSaltRounds
      );

      user = await prisma.user.create({
        data: {
          id: clerkId,
          name: provisionedName,
          email: provisionedEmail,
          password: placeholderPassword,
          role: "USER"
        },
        select: { id: true, email: true, role: true, name: true }
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    const errorMessage = String(error?.message || "");
    const isDatabaseInitFailure =
      error?.name === "PrismaClientInitializationError" ||
      /Authentication failed against database server|Can't reach database server|P1000|P1001/.test(errorMessage);

    if (isDatabaseInitFailure) {
      return next(
        new ApiError(
          503,
          "Database connection failed during authentication. Check DATABASE_URL credentials and database availability."
        )
      );
    }

    return next(new ApiError(401, "Invalid or expired token"));
  }
};

// Export an array of middlewares to process the request sequentially:
// 1. clerkMiddleware() - parses the token from headers
// 2. mapClerkUser - maps Clerk ID to database user
const authMiddleware = [clerkMiddleware(), mapClerkUser];

module.exports = authMiddleware;
