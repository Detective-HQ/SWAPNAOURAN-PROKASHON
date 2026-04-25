const { Webhook } = require("svix");
const prisma = require("../prisma/client");

/**
 * Handles incoming webhooks from Clerk to sync the User table.
 */
exports.clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  // Get the headers correctly from the request object
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ success: false, message: "Error occured -- no svix headers" });
  }

  // To verify the webhook, we need the raw body buffer, which parses cleanly natively due to the route middleware.
  const payload = req.body;
  const body = payload.toString();

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err.message);
    return res.status(400).json({ success: false, message: "Error verifying webhook" });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);

  if (eventType === "user.created") {
    const { email_addresses, first_name, last_name } = evt.data;
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User";
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";

    await prisma.user.upsert({
      where: { id: id },
      update: {
        name,
        email
      },
      create: {
        id: id,
        name,
        email,
        password: "clerk-managed-password" // Placeholder, as auth is via clerk
      }
    });

    return res.status(200).json({ success: true, message: "User created via webhook" });
  }

  if (eventType === "user.updated") {
    const { email_addresses, first_name, last_name } = evt.data;
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User";
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";

    await prisma.user.update({
      where: { id: id },
      data: {
        name,
        email
      }
    });

    return res.status(200).json({ success: true, message: "User updated via webhook" });
  }

  if (eventType === "user.deleted") {
    try {
      await prisma.user.delete({
        where: { id: id }
      });
    } catch (e) {
      // User might already be deleted or not found
      console.error(e);
    }
    
    return res.status(200).json({ success: true, message: "User deleted via webhook" });
  }

  // For any other event, just respond 200 to acknowledge receipt
  return res.status(200).json({ success: true, message: "Event ignored" });
};
