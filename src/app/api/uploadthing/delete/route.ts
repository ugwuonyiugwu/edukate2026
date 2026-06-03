import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  const { fileUrl } = await req.json();
  // UploadThing URLs are typically formatted: https://utfs.io/f/{key}
  const fileKey = fileUrl.split("/f/")[1]; 
  
  if (fileKey) {
    await utapi.deleteFiles(fileKey);
  }
  return NextResponse.json({ success: true });
}