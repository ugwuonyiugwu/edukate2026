import { users, referrals } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const subscriptionRouter = createTRPCRouter({
  verifyAndFulfill: protectedProcedure
    .input(z.object({ 
      transactionId: z.string().optional(),
      tx_ref: z.string().optional(),
      amount: z.number().min(1000, "Minimum subscription is ₦1,000").max(5000, "Maximum subscription is ₦5,000")
    }))
    .mutation(async ({ ctx, input }) => {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
      
      if (!secretKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Flutterwave secret key is not configured on the server." });
      }

      // We can verify using transactionId or search/verify by tx_ref if transactionId is missing
      const lookupId = input.transactionId || input.tx_ref;
      if (!lookupId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Transaction reference is missing." });
      }
      
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${lookupId}/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );

      const data = await verifyRes.json();

      if (data.status !== "success" || data.data.status !== "successful") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Payment verification failed or transaction is incomplete." });
      }

      const amountPaid = data.data.amount;
      const currency = data.data.currency;

      if (amountPaid < input.amount || currency !== "NGN") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Mismatched payment amount or invalid currency." });
      }

      // Fetch the user's current point balance to enforce the 5,000 absolute maximum cap
      const [currentUser] = await ctx.db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId!));
      const currentPoints = currentUser?.points ?? 0;

      if (currentPoints + input.amount > 5000) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Top-up denied: Your balance would exceed the maximum limit of 5,000 points. You currently have ${currentPoints} Pts.` 
        });
      }

      const pointsToAdd = input.amount; 

      // 1. Credit the user's point balance
      await ctx.db.update(users)
        .set({ 
          points: sql`${users.points} + ${pointsToAdd}` 
        })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      // 2. Increment referral count ONLY WHEN the referred user has successfully subscribed (amount >= 1000)
      if (input.amount >= 1000 && currentUser?.referredBy) {
        const [refRecord] = await ctx.db
          .select()
          .from(referrals)
          .where(eq(referrals.referredClerkId, ctx.clerkUserId!));

        if (refRecord && !refRecord.hasQualified) {
          await ctx.db
            .update(referrals)
            .set({ hasQualified: true })
            .where(eq(referrals.id, refRecord.id));

          await ctx.db
            .update(users)
            .set({ referredCount: sql`${users.referredCount} + 1` })
            .where(eq(users.referralCode, currentUser.referredBy));
        }
      }

      return { success: true, addedPoints: pointsToAdd };
    }),
});