import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend"; 
import { db } from "@/db";
import { users, referrals } from "@/db/schema";
import { eq } from "drizzle-orm";

const clerkBackend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add CLERK_SIGNING_SECRET from Dashboard to .env or .env.local"
    );
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { data } = evt;

    const primaryEmail = data.email_addresses?.[0]?.email_address;
    const username = data.username;
    const unsafeMetadata = data.unsafe_metadata || {};

    // Fallback generation if missing from metadata
    const referralCode = (unsafeMetadata.referralCode as string) || 
      `${username ? username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase() : "EDK"}${Math.floor(1000 + Math.random() * 9000)}`;
    const referredBy = (unsafeMetadata.referredBy as string) || null;

    try {
      await db.insert(users).values({
        clerkId: data.id,
        email: primaryEmail || "",
        username: username || "",
        imageUrl: data.image_url || "",
        role: (unsafeMetadata.role as string) || "student",
        referralCode: referralCode,
        referredBy: referredBy,
      });

      // Track initial referral relationship row if a referral code was used
      if (referredBy) {
        const [referrer] = await db.select().from(users).where(eq(users.referralCode, referredBy));
        if (referrer) {
          await db.insert(referrals).values({
            referrerClerkId: referrer.clerkId,
            referredClerkId: data.id,
            hasQualified: false,
          }).onConflictDoNothing();
        }
      }
      
      console.log(`🚀 SUCCESS: User ${data.id} synced to DB`);
    } catch (dbError) {
      console.error(`❌ CRITICAL: Database sync failed for user ${data.id}. Rolling back Clerk account...`, dbError);
      
      try {
        await clerkBackend.users.deleteUser(data.id);
        console.log(`🧹 ROLLBACK SUCCESS: User ${data.id} removed from Clerk.`);
      } catch (clerkDeleteError) {
        console.error(`💥 FAILURE: Could not delete user ${data.id} from Clerk manually!`, clerkDeleteError);
      }

      return new Response("Internal Server Database Sync Error, Rollback triggered", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { data } = evt;
    const primaryEmail = data.email_addresses?.[0]?.email_address;
    const username = data.username;

    await db
      .update(users)
      .set({
        email: primaryEmail,
        username: username,
        imageUrl: data.image_url,
      })
      .where(eq(users.clerkId, data.id as string));
  }

  if (eventType === "user.deleted") {
    const { data } = evt;

    if (!data.id) {
      return new Response("Missing user id", { status: 400 });
    }
    
    await db.delete(users).where(eq(users.clerkId, data.id));
  }

  return new Response("Webhook received", { status: 200 });
}