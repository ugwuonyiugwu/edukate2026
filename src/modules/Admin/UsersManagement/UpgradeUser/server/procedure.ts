// src/server/routers/admin.ts
import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const upgradeRouter = createTRPCRouter({
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select({
      id: users.id,
      username: users.username,
      role: users.role
    }).from(users);
  }),

  updateUserRole: adminProcedure
    .input(z.object({
      targetUserId: z.string(),
      newRole: z.enum(["user", "facilitator", "admin"]),
      notify: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.targetUserId))
        .returning();

      if (updatedUser.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (input.notify) {
        await ctx.db.insert(notifications).values({
          userId: input.targetUserId,
          message: `Your account role has been upgraded to ${input.newRole}.`,
        });
      }

      return updatedUser[0];
    }),
});