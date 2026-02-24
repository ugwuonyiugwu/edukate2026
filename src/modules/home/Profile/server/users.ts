// modules/home/Profile/server/users.ts
import { db } from "@/db";
import { users } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getOne: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user is already fetched in your protectedProcedure middleware
    return ctx.user;
  }),
  update: protectedProcedure
    .input(
      z.object({
        username: z.string().min(2).optional(),
        phoneNumber: z.string().optional(),
        state: z.string().optional(),
        gender: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();
      return updatedUser;
    }),
});