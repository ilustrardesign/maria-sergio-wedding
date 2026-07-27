import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { cpus: 1, workerThreads: true },
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
