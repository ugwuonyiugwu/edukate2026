// @/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Ensure this key is exactly "pdfUploader"
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Ensure this key is exactly "thumbnailUploader"
  thumbnailUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;