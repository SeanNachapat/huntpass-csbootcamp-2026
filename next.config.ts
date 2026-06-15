import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  }
};

export default nextConfig;

