import type { NextConfig } from "next";

// Vercel会自动注入VERCEL环境变量，无需手动配置
const isVercel = process.env.VERCEL === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Vercel环境自动禁用路径配置，其他环境启用
  basePath: isVercel ? "" : basePath,
  assetPrefix: isVercel ? "" : basePath,
  images: {
    // Vercel环境启用优化，其他静态部署环境禁用
    unoptimized: !isVercel,
  },
  // 部署容错配置
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;