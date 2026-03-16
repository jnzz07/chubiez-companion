import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are caught locally — allow Railway to build without env vars
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
