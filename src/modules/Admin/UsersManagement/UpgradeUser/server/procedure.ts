// src/server/routers/admin.ts
import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      newRole: z.enum(["user", "facilitator", "admin"])
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.targetUserId));
    }),
});