import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all hosts in development
  allowedDevOrigins: ["*"],

  // Images from external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
