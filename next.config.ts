import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" optimizes the app for production deployments within Docker
  // see more in https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
  output: "standalone",
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
