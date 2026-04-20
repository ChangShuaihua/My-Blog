import type { NextConfig } from "next";

// 扩展类型，兼容旧版eslint配置，解决TS类型报错
declare module "next" {
  interface NextConfig {
    eslint?: {
      ignoreDuringBuilds?: boolean;
    };
  }
}

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
  // 此处不再报TS类型错误
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;