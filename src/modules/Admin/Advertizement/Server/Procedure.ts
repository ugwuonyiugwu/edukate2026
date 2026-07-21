import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { settings } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm"; // Ensure you import eq

export const settingsRouter = createTRPCRouter({
  getAnnouncement: adminProcedure.query(async ({ ctx }) => {
    const setting = await ctx.db.query.settings.findFirst();
    return setting ?? { announcementText: "Welcome!", popupImageUrl: null };
  }),

  updateAnnouncement: adminProcedure
    .input(z.object({ 
      text: z.string(),
      imageUrl: z.string().url().optional().or(z.literal("")), 
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Find existing record
        const existing = await ctx.db.query.settings.findFirst();

        if (existing) {
          // 2. Update existing row by its actual ID
          await ctx.db.update(settings)
            .set({ 
              announcementText: input.text, 
              popupImageUrl: input.imageUrl || null,
              updatedAt: new Date() 
            })
            .where(eq(settings.id, existing.id));
        } else {
          // 3. Insert new row (let 'serial' handle the ID automatically)
          await ctx.db.insert(settings)
            .values({ 
              announcementText: input.text, 
              popupImageUrl: input.imageUrl || null 
            });
        }
        return { success: true };
      } catch (error) {
        console.error("Settings Update Error:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to update settings." 
        });
      }
    }),
});