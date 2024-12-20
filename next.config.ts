import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ada-2024-project-sadamasochists-react",
  assetPrefix: "/ada-2024-project-sadamasochists-react",  // Removed trailing slash
  trailingSlash: true,
  images: {
    unoptimized: true, // Add this for static export
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;