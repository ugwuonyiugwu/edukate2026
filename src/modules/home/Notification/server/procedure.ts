// src/server/routers/notification.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const notificationRouter = createTRPCRouter({
  // Fetch list of notifications
  getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt)); // Most recent first
  }),

  hasUnread: protectedProcedure.query(async ({ ctx }) => {
    const unread = await ctx.db.query.notifications.findFirst({
      where: and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ),
    });

    return !!unread; // Returns true if an unread notification exists
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
});