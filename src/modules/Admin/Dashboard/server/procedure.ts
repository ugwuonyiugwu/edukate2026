import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { users, documents, libraries, quizzes } from "@/db/schema";
import { count, sql, eq, sum } from "drizzle-orm";
import z from "zod";

export const adminRouter = createTRPCRouter({
  // Efficient independent counts to avoid Cartesian product errors
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
  const [totalUsers, totalAdmins, totalFacilitators, totalDocs, totalLibraries, totalQuizzes, pointsData] = await Promise.all([
    ctx.db.select({ count: count() }).from(users),
    ctx.db.select({ count: count() }).from(users).where(eq(users.role, 'admin')),
    ctx.db.select({ count: count() }).from(users).where(eq(users.role, 'facilitator')),
    ctx.db.select({ count: count() }).from(documents),
    ctx.db.select({ count: count() }).from(libraries),
    ctx.db.select({ count: count() }).from(quizzes),
    ctx.db.select({ totalPoints: sum(users.points) }).from(users),
  ]);

  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    totalAdmins: totalAdmins[0]?.count ?? 0,
    totalFacilitators: totalFacilitators[0]?.count ?? 0,
    totalDocuments: totalDocs[0]?.count ?? 0,
    totalLibraries: totalLibraries[0]?.count ?? 0,
    totalQuizzes: totalQuizzes[0]?.count ?? 0,
    totalPoints: pointsData[0]?.totalPoints ?? 0,
   };
  }),

  // Fetches all user details for the table
  getUsers: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(users);
  }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(users).where(eq(users.id, input.userId));
    }),

  updateUserPoints: adminProcedure
    .input(z.object({ userId: z.string(), points: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(users)
        .set({ points: input.points })
        .where(eq(users.id, input.userId));
    }),
});