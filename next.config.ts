import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Disable type checking during the build
  },
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint checks during the build
  },
  output: "export", // Ensure the app is statically exported
  basePath: "/ada-2024-project-sadamasochists-react", // GitHub Pages base path
  trailingSlash: true, // Add trailing slashes to routes for static deployment
};

export default nextConfig;
