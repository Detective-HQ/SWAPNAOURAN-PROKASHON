const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { clerkMiddleware, requireAuth } = require("@clerk/express");

/**
 * We wrap our logic inside a generic middleware handler.
 * Clerk's requireAuth() ensures req.auth.userId exists.
 */
const clerkVerify = requireAuth();

const mapClerkUser = async (req, res, next) => {
  try {
    // req.auth.userId is the Clerk ID (e.g. user_...)
    const clerkId = req.auth.userId;

    // We can assume we need a user in our DB to maintain relations.
    // Ideally, there should be a webhook creating users with this 'id' or 'email'.
    // For now, if your DB uses `id: String`, we'll try to find by `id: clerkId`.
    let user = await prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, email: true, role: true, name: true }
    });

    if (!user) {
      // Auto-fallback mapping for active session missing from local db:
      // (Normally this happens via a Clerk webhook. If we just want testing, we can dummy it or error.)
      return next(new ApiError(401, "User exists in Clerk but not synced to the local database."));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

// Export an array of middlewares to process the request sequentially:
// 1. clerkMiddleware parses the token
// 2. clerkVerify ensures it is valid
// 3. mapClerkUser maps it to Prisma
const authMiddleware = [clerkMiddleware(), clerkVerify, mapClerkUser];

module.exports = authMiddleware;
