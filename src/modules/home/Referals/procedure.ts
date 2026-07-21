import { users, referrals } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const referralRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId!));
    
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    return {
      referralCode: user.referralCode,
      referralLink: `${baseUrl}/signup?ref=${user.referralCode}`,
      numberOfBusinesses: user.referredCount, // Reflects incremented count safely
      totalCommission: 0.00, // No immediate cash/commission reward distributed yet
    };
  }),
});