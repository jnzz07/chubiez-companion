import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are caught locally — allow Railway to build without env vars
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
