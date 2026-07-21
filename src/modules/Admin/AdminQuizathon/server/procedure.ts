import { TRPCError } from "@trpc/server";
import { eq, and, asc, desc, count } from "drizzle-orm"; 
import { z } from "zod";
import { UTApi } from "uploadthing/server"; 
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { quizEvents, quizRegistrations, users, quizQuestions, quizBatches } from "@/db/schema";

const utapi = new UTApi();

export const adminQuizRouter = createTRPCRouter({
  updateEvent: adminProcedure
    .input(z.object({
      id: z.number().optional(), 
      title: z.string().min(1),
      registrationDeadline: z.date(),
      subjects: z.array(z.string()), 
      pointCost: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        return await ctx.db.update(quizEvents).set({
          title: input.title,
          registrationDeadline: input.registrationDeadline,
          subjects: input.subjects,
          pointCost: input.pointCost,
        }).where(eq(quizEvents.id, input.id));
      }
      await ctx.db.update(quizEvents).set({ isActive: false });

      const [newEvent] = await ctx.db.insert(quizEvents).values({
        title: input.title,
        registrationDeadline: input.registrationDeadline,
        subjects: input.subjects,
        pointCost: input.pointCost,
        isActive: true,
      }).returning();

      return newEvent;
    }),

  getRegistrations: adminProcedure.query(async ({ ctx }) => {
    const activeEvent = await ctx.db.query.quizEvents.findFirst({
      where: eq(quizEvents.isActive, true),
    });

    if (!activeEvent) return [];

    const serverNow = Date.now();

    const rawRegistrations = await ctx.db
      .select({
        id: quizRegistrations.id,
        clerkId: quizRegistrations.clerkId,
        userName: users.username,
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
      .where(eq(quizRegistrations.quizEventId, activeEvent.id))
      .orderBy(
        desc(quizRegistrations.score),
        desc(quizRegistrations.registeredAt)
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

  updateParticipantScore: adminProcedure
    .input(z.object({ 
      registrationId: z.number(), 
      score: z.number().min(0).max(100) 
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(quizRegistrations)
        .set({ score: input.score })
        .where(eq(quizRegistrations.id, input.registrationId));
    }),

  deleteRegistration: adminProcedure
    .input(z.object({ registrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(quizRegistrations)
        .where(eq(quizRegistrations.id, input.registrationId));
    }),

  getBatchesByEvent: adminProcedure
    .input(z.object({ quizEventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.quizBatches.findMany({
        where: eq(quizBatches.quizEventId, input.quizEventId),
        orderBy: [asc(quizBatches.id)],
      });
    }),

  createBatch: adminProcedure
    .input(z.object({
      quizEventId: z.number(),
      name: z.string(),
      quizDate: z.date(),
      maxCapacity: z.number().default(50),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(quizBatches).values({
        quizEventId: input.quizEventId,
        name: input.name,
        quizDate: input.quizDate,
        maxCapacity: input.maxCapacity,
      });
    }),

  updateBatch: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      quizDate: z.date().optional(),
      maxCapacity: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.update(quizBatches)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.quizDate && { quizDate: input.quizDate }),
          ...(input.maxCapacity && { maxCapacity: input.maxCapacity }),
        })
        .where(eq(quizBatches.id, input.id));
    }),

  deleteBatch: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(quizBatches).where(eq(quizBatches.id, input.id));
    }),

  getQuestionsBySubject: adminProcedure
    .input(z.object({ 
      quizId: z.number(), 
      subject: z.string() 
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.quizQuestions.findMany({
        where: and(
          eq(quizQuestions.quizEventId, input.quizId),
          eq(quizQuestions.subject, input.subject)
        ),
        orderBy: [asc(quizQuestions.id)],
      });
    }),

  addQuestion: adminProcedure
    .input(z.object({
      quizEventId: z.number(),
      subject: z.string(),
      questionText: z.string().min(1),
      imageUrl: z.string().optional().nullable(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!input.options.includes(input.correctAnswer)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Correct answer must match one of the options exactly.",
        });
      }

      return await ctx.db.insert(quizQuestions).values({
        quizEventId: input.quizEventId,
        subject: input.subject,
        questionText: input.questionText,
        imageUrl: input.imageUrl,
        options: input.options,
        correctAnswer: input.correctAnswer,
      });
    }),

  deleteQuestion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.query.quizQuestions.findFirst({
        where: eq(quizQuestions.id, input.id),
      });

      if (question?.imageUrl) {
        try {
          const fileKey = question.imageUrl.split("/").pop();
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
          }
        } catch (error) {
          console.error("Failed to safely prune asset from UploadThing backend registry:", error);
        }
      }
      return await ctx.db
        .delete(quizQuestions)
        .where(eq(quizQuestions.id, input.id));
    }),
});