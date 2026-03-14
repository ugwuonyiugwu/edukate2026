import { z } from "zod";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { documents, libraries } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Helper to extract UploadThing keys for deletion
const extractKey = (url: string | null | undefined) => {
  if (!url) return null;
  return url.includes("/f/") ? url.split("/f/")[1] : url.split("/").pop();
};

export const documentRouter = createTRPCRouter({
  // --- LIBRARY PROCEDURES ---

  getAllLibraries: baseProcedure.query(async ({ ctx }) => {
    const allLibs = await ctx.db.query.libraries.findMany({
      with: {
        documents: true, 
      },
      orderBy: [desc(libraries.createdAt)],
    });

    // Map the results to calculate cumulative downloads while preserving the documents array
    return allLibs.map((lib) => ({
      ...lib,
      totalDownloads: lib.documents.reduce((acc, doc) => acc + (doc.downloads || 0), 0),
    }));
  }),

  getLibrary: protectedProcedure.query(async ({ ctx }) => {
    const lib = await ctx.db.query.libraries.findFirst({
      where: eq(libraries.clerkId, ctx.user.id),
      with: { documents: true }
    });
    return lib ?? null;
  }),

  createLibrary: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      thumbnailUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [newLib] = await ctx.db.insert(libraries).values({
        clerkId: ctx.user.id,
        name: input.name,
        thumbnailUrl: input.thumbnailUrl ?? null,
      }).returning();
      return newLib;
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
        .where(eq(libraries.clerkId, ctx.user.id))
        .returning();

      if (!updatedLib) throw new TRPCError({ code: "NOT_FOUND" });
      return updatedLib;
    }),

  deleteLibrary: protectedProcedure.mutation(async ({ ctx }) => {
    const libWithDocs = await ctx.db.query.libraries.findFirst({
      where: eq(libraries.clerkId, ctx.user.id),
      with: { documents: true }
    });

    if (!libWithDocs) throw new TRPCError({ code: "NOT_FOUND" });

    const keysToDelete: string[] = [];
    const libThumbKey = extractKey(libWithDocs.thumbnailUrl);
    if (libThumbKey) keysToDelete.push(libThumbKey);

    libWithDocs.documents.forEach((doc) => {
      const fileKey = extractKey(doc.fileUrl);
      if (fileKey) keysToDelete.push(fileKey);
      
      const docThumbKey = extractKey(doc.thumbnailUrl);
      if (docThumbKey) keysToDelete.push(docThumbKey);
    });

    if (keysToDelete.length > 0) {
      try {
        await utapi.deleteFiles(keysToDelete);
      } catch (error) {
        console.error("UT_DELETE_ERROR:", error);
      }
    }

    const [deleted] = await ctx.db
      .delete(libraries)
      .where(eq(libraries.id, libWithDocs.id))
      .returning();

    return deleted;
  }),

  // --- EXISTING DOCUMENT PROCEDURES ---

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
      const lib = await ctx.db.query.libraries.findFirst({
        where: eq(libraries.clerkId, ctx.user.id)
      });

      const [newDoc] = await ctx.db.insert(documents).values({
        clerkId: ctx.user.id,
        name: input.name,
        subject: input.subject,
        description: input.description,
        fileUrl: input.fileUrl,
        thumbnailUrl: input.thumbnailUrl ?? null,
        libraryId: lib?.id ?? null,
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

      const keys = [extractKey(doc.fileUrl)];
      const thumbKey = extractKey(doc.thumbnailUrl);
      if (thumbKey) keys.push(thumbKey);

      await utapi.deleteFiles(keys.filter((k): k is string => !!k));
      
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