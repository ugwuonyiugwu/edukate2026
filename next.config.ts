import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** @type {import('next').NextConfig} */

   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-upload-service.com', // e.g., 'ucarecdn.com' or 'res.cloudinary.com'
      },
      // Keep Clerk whitelisted if you still use their default avatars as fallbacks
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
