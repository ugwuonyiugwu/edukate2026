import { db } from "@/db";
import { users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, adminProcedure, baseProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // SELF: Logged in user dashboard - Fresh fetch ensures 'role' is current
  getOne: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.clerkUserId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.clerkUserId))
      .limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    
    return user;
  }),

  // ADMIN VIEW: Full record including sensitive points
  getByIdAdmin: adminProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, input.clerkId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),

  getPublicProfile: baseProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          imageUrl: users.imageUrl,
          school: users.school,
          state: users.state,
          role: users.role,
        })
        .from(users)
        .where(eq(users.clerkId, input.clerkId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),

  // UPDATED: Added guard clause to fix type mismatch with eq(users.clerkId, ctx.clerkUserId)
  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().nullish(),
      lastName: z.string().nullish(),
      phoneNumber: z.string().nullish(),
      school: z.string().nullish(),
      gender: z.string().nullish(),
      dateOfBirth: z.string().nullish(),
      state: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clerkUserId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [updatedUser] = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, ctx.clerkUserId))
        .returning();

      return updatedUser;
    }),
});