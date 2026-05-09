const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { clerkMiddleware, clerkClient } = require("@clerk/express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const env = require("../config/env");

/**
 * Updated to use the new Clerk API
 * clerkMiddleware() parses the auth token
 * req.auth() returns the auth object (replaces deprecated req.auth property)
 *
 * When auto-provisioning a new user, fetches the full user profile from
 * Clerk's Backend API (via clerkClient) so real email / name are stored
 * instead of placeholder values.
 */
const mapClerkUser = async (req, res, next) => {
  try {
    // Get auth using Clerk's request helper.
    const auth = typeof req.auth === "function" ? req.auth() : req.auth;
    
    if (!auth || !auth.userId) {
      return next(new ApiError(401, "Unauthorized - No valid authentication token"));
    }

    const clerkId = auth.userId;

    // ── 1. Look up by Clerk ID ──────────────────────────────────────────
    let user = await prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, email: true, role: true, name: true }
    });

    if (user) {
      req.user = user;
      return next();
    }

    // ── 2. Fetch full profile from Clerk Backend API ────────────────────
    //    Session claims do NOT include email/name by default, so we call
    //    the Clerk Backend API to get the authoritative user data.
    let clerkEmail = null;
    let clerkName = null;

    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);

      // Primary email
      if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
        const primary = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        );
        clerkEmail = primary
          ? primary.emailAddress
          : clerkUser.emailAddresses[0].emailAddress;
      }

      // Full name
      const first = clerkUser.firstName || "";
      const last = clerkUser.lastName || "";
      clerkName = `${first} ${last}`.trim() || null;
    } catch (clerkApiErr) {
      console.error("Failed to fetch Clerk user profile:", clerkApiErr.message);
      // Continue with whatever info we have from session claims
      const sessionClaims = auth.sessionClaims || {};
      clerkEmail =
        sessionClaims.email ||
        sessionClaims.email_address ||
        sessionClaims.primaryEmail ||
        null;
      const firstName = sessionClaims.given_name || "";
      const lastName = sessionClaims.family_name || "";
      clerkName = sessionClaims.name || `${firstName} ${lastName}`.trim() || null;
    }

    // ── 3. Check if a local account already exists with same email ──────
    if (clerkEmail) {
      user = await prisma.user.findUnique({
        where: { email: clerkEmail },
        select: { id: true, email: true, role: true, name: true }
      });
    }

    // ── 4. Auto-provision the user ──────────────────────────────────────
    if (!user) {
      const provisionedEmail = clerkEmail || `${clerkId}@clerk.local`;
      const provisionedName = clerkName || `Clerk User ${clerkId.slice(-6)}`;
      const placeholderPassword = await bcrypt.hash(
        `clerk:${crypto.randomUUID()}`,
        env.bcryptSaltRounds
      );

      user = await prisma.user.upsert({
        where: { id: clerkId },
        update: {
          name: provisionedName,
          email: provisionedEmail,
        },
        create: {
          id: clerkId,
          name: provisionedName,
          email: provisionedEmail,
          password: placeholderPassword,
          role: "USER"
        },
        select: { id: true, email: true, role: true, name: true }
      });

      console.log(`✅ Auto-provisioned Clerk user ${clerkId} → ${provisionedEmail}`);
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    const errorMessage = String(error?.message || "");
    const isDatabaseFailure =
      error?.name === "PrismaClientInitializationError" ||
      error?.code === "P2024" ||
      /Authentication failed against database server|Can't reach database server|P1000|P1001|P2024/.test(errorMessage);

    if (isDatabaseFailure) {
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
