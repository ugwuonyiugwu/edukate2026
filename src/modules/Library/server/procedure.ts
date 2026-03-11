import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { documents } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// This MUST have the 'export' keyword
export const documentRouter = createTRPCRouter({
  getMyDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .select()
        .from(documents)
        .where(eq(documents.clerkId, ctx.user.id))
        .orderBy(desc(documents.createdAt));
    } catch (error) {
      console.error("FETCH_ERROR:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      description: z.string().min(1),
      fileUrl: z.string().url(),
      thumbnailUrl: z.string().url().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [newDoc] = await ctx.db.insert(documents).values({
        clerkId: ctx.user.id,
        name: input.name,
        subject: input.subject,
        description: input.description,
        fileUrl: input.fileUrl,
        thumbnailUrl: input.thumbnailUrl ?? null,
      }).returning();
      return newDoc;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db
        .select()
        .from(documents)
        .where(and(eq(documents.id, input.id), eq(documents.clerkId, ctx.user.id)));

      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

      const extractKey = (url: string) => url.includes("/f/") ? url.split("/f/")[1] : url.split("/").pop();
      const keys = [extractKey(doc.fileUrl)];
      if (doc.thumbnailUrl) keys.push(extractKey(doc.thumbnailUrl)!);

      await utapi.deleteFiles(keys.filter(Boolean) as string[]);
      
      const [deletedDoc] = await ctx.db.delete(documents).where(eq(documents.id, input.id)).returning();
      return deletedDoc;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1),
      subject: z.string().min(1),
      description: z.string().min(1),
      thumbnailUrl: z.string().url().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updatedDoc] = await ctx.db
        .update(documents)
        .set({
          name: input.name,
          subject: input.subject,
          description: input.description,
          thumbnailUrl: input.thumbnailUrl ?? null,
        })
        .where(and(eq(documents.id, input.id), eq(documents.clerkId, ctx.user.id)))
        .returning();

      if (!updatedDoc) throw new TRPCError({ code: "NOT_FOUND" });
      return updatedDoc;
    }),
});