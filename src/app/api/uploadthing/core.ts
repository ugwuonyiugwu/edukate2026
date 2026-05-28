import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Existing PDF Uploader
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Existing Thumbnail Uploader
  thumbnailUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Existing Library Cover Uploader
  libraryThumbnailUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Generic Authenticated Image Uploader
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      if (!user || !user.userId) throw new Error("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      return { url: file.url, uploadedBy: metadata.userId };
    }),

  // Course Classroom Assets
  classImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url || file.ufsUrl };
    }),
    
  classPdf: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url || file.ufsUrl };
    }),

  // Dedicated Question Image for another page
  questionImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      return { url: file.url };
    }),

  // 🌟 NEW: Dedicated Quizathon Question Bank Endpoint
  quizathonImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Ensure the user is authenticated via Clerk before handling uploads
      const user = await auth();
      if (!user || !user.userId) throw new Error("Unauthorized");
      
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Quizathon asset upload completed by user:", metadata.userId);
      console.log("Target Resource URL:", file.url);
      
      // Returns standard URL payload back to the frontend hook
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;