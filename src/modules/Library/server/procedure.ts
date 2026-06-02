import { z } from "zod";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { documents, libraries } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const extractKey = (url: string | null | undefined) => {
  if (!url) return null;
  return url.includes("/f/") ? url.split("/f/")[1] : url.split("/").pop();
};

export const documentRouter = createTRPCRouter({
  // --- LIBRARY PROCEDURES ---

  getAllLibraries: baseProcedure.query(async ({ ctx }) => {
    const allLibs = await ctx.db.query.libraries.findMany({
      with: { documents: true },
      orderBy: [desc(libraries.createdAt)],
    });
    return allLibs.map((lib) => ({
      ...lib,
      totalDownloads: lib.documents.reduce((acc, doc) => acc + (doc.downloads || 0), 0),
    }));
  }),
  getDocumentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.id),
      });

      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });
      return doc;
    }),

  getLibraryById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const library = await ctx.db.query.libraries.findFirst({
        where: eq(libraries.id, input.id),
        with: { documents: true }
      });
      
      if (!library) throw new TRPCError({ code: "NOT_FOUND" });
      return library;
    }),
    
  getLibrary: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.libraries.findFirst({
      where: eq(libraries.clerkId, ctx.user.clerkId),
      with: { documents: true }
    }) ?? null;
  }),

  // src/modules/Library/server/procedure.ts

createLibrary: protectedProcedure
  .input(z.object({
    name: z.string().min(1),
    thumbnailUrl: z.string().url().nullish(),
  }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db
      .insert(libraries)
      .values({
        clerkId: ctx.user.clerkId, // Use the clerkId string, NOT the UUID
        name: input.name,
        thumbnailUrl: input.thumbnailUrl ?? null,
      })
      .onConflictDoUpdate({
        target: libraries.clerkId,
        set: {
          name: input.name,
          thumbnailUrl: input.thumbnailUrl ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();
  }),
  updateLibrary: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      thumbnailUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updatedLib] = await ctx.db
        .update(libraries)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.thumbnailUrl && { thumbnailUrl: input.thumbnailUrl }),
          updatedAt: new Date(),
        })
        .where(eq(libraries.clerkId, ctx.user.clerkId))
        .returning();
      if (!updatedLib) throw new TRPCError({ code: "NOT_FOUND" });
      return updatedLib;
    }),

  deleteLibrary: protectedProcedure.mutation(async ({ ctx }) => {
    const libWithDocs = await ctx.db.query.libraries.findFirst({
      where: eq(libraries.clerkId, ctx.user.clerkId),
      with: { documents: true }
    });
    if (!libWithDocs) throw new TRPCError({ code: "NOT_FOUND" });

    const keys = [
      extractKey(libWithDocs.thumbnailUrl),
      ...libWithDocs.documents.flatMap(d => [extractKey(d.fileUrl), extractKey(d.thumbnailUrl)])
    ].filter((k): k is string => !!k);

    if (keys.length > 0) await utapi.deleteFiles(keys).catch(console.error);

    return await ctx.db.delete(libraries).where(eq(libraries.id, libWithDocs.id)).returning();
  }),

  // --- DOCUMENT PROCEDURES ---

  getMyDocuments: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(documents)
      .where(eq(documents.clerkId, ctx.user.clerkId))
      .orderBy(desc(documents.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      description: z.string().min(1),
      videoUrl: z.string().nullish(),
      fileUrl: z.string().url(),
      thumbnailUrl: z.string().url().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const lib = await ctx.db.query.libraries.findFirst({ where: eq(libraries.clerkId, ctx.user.clerkId) });
      return await ctx.db.insert(documents).values({
        clerkId: ctx.user.clerkId,
        name: input.name,
        subject: input.subject,
        description: input.description,
        videoUrl: input.videoUrl ?? null,
        fileUrl: input.fileUrl,
        thumbnailUrl: input.thumbnailUrl ?? null,
        libraryId: lib?.id ?? null,
      }).returning();
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db.select().from(documents).where(and(eq(documents.id, input.id), eq(documents.clerkId, ctx.user.clerkId)));
      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

      const keys = [extractKey(doc.fileUrl), extractKey(doc.thumbnailUrl)].filter((k): k is string => !!k);
      await utapi.deleteFiles(keys).catch(console.error);
      
      return (await ctx.db.delete(documents).where(eq(documents.id, input.id)).returning())[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1),
      subject: z.string().min(1),
      description: z.string().min(1),
      videoUrl: z.string().nullish(),
      thumbnailUrl: z.string().url().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updatedDoc] = await ctx.db
        .update(documents)
        .set({
          name: input.name,
          subject: input.subject,
          description: input.description,
          videoUrl: input.videoUrl ?? null,
          thumbnailUrl: input.thumbnailUrl ?? null,
        })
        .where(and(eq(documents.id, input.id), eq(documents.clerkId, ctx.user.clerkId)))
        .returning();
      if (!updatedDoc) throw new TRPCError({ code: "NOT_FOUND" });
      return updatedDoc;
    }),
});