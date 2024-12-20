import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Disable type checking during the build
  },
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint checks during the build
  },
  /* Add other config options here if needed */
};

export default nextConfig;
