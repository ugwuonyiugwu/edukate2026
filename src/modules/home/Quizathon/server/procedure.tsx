import { TRPCError } from "@trpc/server";
import { eq, and, asc, desc, count, inArray } from "drizzle-orm"; 
import { z } from "zod";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { quizEvents, quizRegistrations, users, quizQuestions, quizBatches } from "@/db/schema";

export const userQuizRouter = createTRPCRouter({
  getLatestEvent: baseProcedure.query(async ({ ctx }) => {
    const event = await ctx.db.query.quizEvents.findFirst({
      where: eq(quizEvents.isActive, true),
      orderBy: [desc(quizEvents.registrationDeadline)],
    });

    if (!event) return null;

    const isExpired = new Date() > new Date(event.registrationDeadline);

    return {
      ...event,
      isExpired,
    };
  }),

  getUserRegistrations: protectedProcedure.query(async ({ ctx }) => {
    const activeEvent = await ctx.db.query.quizEvents.findFirst({
      where: eq(quizEvents.isActive, true),
    });

    if (!activeEvent) return [];

    const serverNow = Date.now();

    const rawRegistrations = await ctx.db
      .select({
        id: quizRegistrations.id,
        clerkId: quizRegistrations.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.imageUrl,
        selectedSubjects: quizRegistrations.selectedSubjects,
        pointsSpent: quizRegistrations.pointsSpent,
        score: quizRegistrations.score,
        registeredAt: quizRegistrations.registeredAt,
        batchName: quizBatches.name,
        batchDate: quizBatches.quizDate,
      })
      .from(quizRegistrations)
      .innerJoin(users, eq(quizRegistrations.clerkId, users.clerkId))
      .leftJoin(quizBatches, eq(quizRegistrations.batchId, quizBatches.id))
      .where(
        and(
          eq(quizRegistrations.quizEventId, activeEvent.id),
          eq(quizRegistrations.clerkId, ctx.user.clerkId) 
        )
      );

    return rawRegistrations.map((reg) => {
      let examTargetTimestamp: number | null = null;
      if (reg.batchDate) {
        const dateStr = typeof reg.batchDate === 'string' 
          ? reg.batchDate 
          : new Date(reg.batchDate).toISOString();

        const pureDatePart = dateStr.split('T')[0];
        examTargetTimestamp = new Date(`${pureDatePart}T11:00:00.000Z`).getTime();
      }

      return {
        ...reg,
        serverCurrentTimestamp: serverNow,
        examTargetTimestamp,
      };
    });
  }),

  register: protectedProcedure
    .input(z.object({ selectedSubjects: z.array(z.string()).length(4) }))
    .mutation(async ({ ctx, input }) => {
      const userClerkId = ctx.user.clerkId;

      const [activeEvent, userData] = await Promise.all([
        ctx.db.query.quizEvents.findFirst({ where: eq(quizEvents.isActive, true) }),
        ctx.db.query.users.findFirst({ where: eq(users.clerkId, userClerkId) })
      ]);

      if (!activeEvent || !userData) throw new TRPCError({ code: "NOT_FOUND" });

      if (new Date() > new Date(activeEvent.registrationDeadline)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Registration for this event has closed.",
        });
      }
      
      if (userData.points < activeEvent.pointCost) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient score/points" });
      }

      const existing = await ctx.db.query.quizRegistrations.findFirst({
        where: and(
          eq(quizRegistrations.quizEventId, activeEvent.id), 
          eq(quizRegistrations.clerkId, userClerkId)
        ),
      });

      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already registered" });

      const availableBatches = await ctx.db.query.quizBatches.findMany({
        where: eq(quizBatches.quizEventId, activeEvent.id),
        orderBy: [asc(quizBatches.id)],
      });

      let assignedBatchId: number | null = null;
      for (const batch of availableBatches) {
        const [regCount] = await ctx.db
          .select({ value: count() })
          .from(quizRegistrations)
          .where(eq(quizRegistrations.batchId, batch.id));

        if (regCount.value < batch.maxCapacity) {
          assignedBatchId = batch.id;
          break; 
        }
      }

      if (!assignedBatchId) {
        throw new TRPCError({ 
          code: "PRECONDITION_FAILED", 
          message: "All examination slots are currently full." 
        });
      }

      await ctx.db.batch([
        ctx.db.update(users)
          .set({ points: userData.points - activeEvent.pointCost })
          .where(eq(users.clerkId, userClerkId)),

        ctx.db.insert(quizRegistrations).values({
          quizEventId: activeEvent.id,
          batchId: assignedBatchId,
          clerkId: userClerkId,
          selectedSubjects: input.selectedSubjects,
          pointsSpent: activeEvent.pointCost,
          score: 0,
        })
      ]);

      return { success: true };
    }),

  getLiveExamQuestions: protectedProcedure.query(async ({ ctx }) => {
    const serverNow = Date.now();

    const activeEvent = await ctx.db.query.quizEvents.findFirst({
      where: eq(quizEvents.isActive, true),
    });
    if (!activeEvent) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No active exam event found." });
    }

    const registration = await ctx.db.query.quizRegistrations.findFirst({
      where: and(
        eq(quizRegistrations.quizEventId, activeEvent.id),
        eq(quizRegistrations.clerkId, ctx.user.clerkId)
      ),
    });

    if (!registration) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not registered for this examination." });
    }

    if (registration.completedAt) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have already completed and submitted this examination. Retakes are prohibited.",
      });
    }

    const userBatch = registration.batchId 
      ? await ctx.db.query.quizBatches.findFirst({ where: eq(quizBatches.id, registration.batchId) })
      : null;

    if (!userBatch?.quizDate) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Your assigned examination batch configuration is missing." });
    }

    const dateStr = typeof userBatch.quizDate === 'string' 
      ? userBatch.quizDate 
      : new Date(userBatch.quizDate).toISOString();

    const pureDatePart = dateStr.split('T')[0];
    
    const examStartTimestamp = new Date(`${pureDatePart}T11:00:00.000Z`).getTime();
    const examEndTimestamp = examStartTimestamp + (180 * 60 * 1000); 

    if (serverNow < examStartTimestamp) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "The examination portal is locked. Please wait until the scheduled time.",
      });
    }

    if (serverNow >= examEndTimestamp) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "The scheduled time slot window for this examination batch has expired.",
      });
    }

    const secondsRemaining = Math.max(0, Math.floor((examEndTimestamp - serverNow) / 1000));

    const subjectsToFetch = registration.selectedSubjects;
    if (!subjectsToFetch || subjectsToFetch.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No subjects registered under this user session." });
    }

    const rawQuestions = await ctx.db.query.quizQuestions.findMany({
      where: and(
        eq(quizQuestions.quizEventId, activeEvent.id),
        inArray(quizQuestions.subject, subjectsToFetch)
      ),
    });

    for (let i = rawQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawQuestions[i], rawQuestions[j]] = [rawQuestions[j], rawQuestions[i]];
    }

    const categorizedQuestions: Record<string, typeof rawQuestions> = {};
    
    subjectsToFetch.forEach((subj) => {
      categorizedQuestions[subj] = [];
    });

    rawQuestions.forEach((q) => {
      if (categorizedQuestions[q.subject]) {
        categorizedQuestions[q.subject].push(q);
      }
    });

    return {
      categorizedQuestions,
      secondsRemaining,
    };
  }),

  submitFinalScore: protectedProcedure
    .input(z.object({
      quizEventId: z.coerce.number(),
      totalScore: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userClerkId = ctx.user.clerkId;

      const activeEvent = await ctx.db.query.quizEvents.findFirst({
        where: eq(quizEvents.isActive, true),
      });

      if (!activeEvent) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "There is no currently active exam event accepting submissions.",
        });
      }

      const registration = await ctx.db.query.quizRegistrations.findFirst({
        where: and(
          eq(quizRegistrations.quizEventId, activeEvent.id),
          eq(quizRegistrations.clerkId, userClerkId)
        ),
      });

      if (!registration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No open examination record found matching your user context for this active event.",
        });
      }

      if (registration.completedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This examination record has already been turned in.",
        });
      }

      await ctx.db
        .update(quizRegistrations)
        .set({
          score: input.totalScore,
          completedAt: new Date(),
        })
        .where(eq(quizRegistrations.id, registration.id));

      return { success: true };
    }),
});