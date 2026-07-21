// src/server/routers/notification.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { notifications, users } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createTRPCRouter({
  getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt));
  }),

  hasUnread: protectedProcedure.query(async ({ ctx }) => {
    const unread = await ctx.db.query.notifications.findFirst({
      where: and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ),
    });
    return !!unread;
  }),

  markAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));
  }),

  // Fetch users for admin selection dropdown with role verification
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.query.users.findFirst({
      where: eq(users.clerkId, ctx.clerkUserId!),
    });
    if (!currentUser || currentUser.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized." });
    }

    return await ctx.db.select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      email: users.email,
    }).from(users).orderBy(asc(users.username));
  }),

  // Admin mutation to send notifications (link field removed)
  send: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      targetType: z.enum(["all", "selected"]),
      userIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify admin role
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.clerkId, ctx.clerkUserId!),
      });
      if (!currentUser || currentUser.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can send notifications." });
      }

      let targetUserIds: string[] = [];

      if (input.targetType === "all") {
        const allUsers = await ctx.db.select({ id: users.id }).from(users);
        targetUserIds = allUsers.map((u) => u.id);
      } else if (input.userIds && input.userIds.length > 0) {
        targetUserIds = input.userIds;
      }

      if (targetUserIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No target users found." });
      }

      const valuesToInsert = targetUserIds.map((userId) => ({
        userId,
        message: input.message,
      }));

      await ctx.db.insert(notifications).values(valuesToInsert);

      return { success: true, count: targetUserIds.length };
    }),
});