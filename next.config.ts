import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // GitHub Pages 等静态托管环境启用静态导出
  ...(isVercel ? {} : { output: "export" as const }),
  // Vercel环境自动禁用路径配置，其他环境启用
  basePath: isVercel ? "" : basePath,
  assetPrefix: isVercel ? "" : basePath,
  images: {
    // Vercel环境启用优化，其他静态部署环境禁用
    unoptimized: !isVercel,
  },
  // 部署容错配置（类型检查可在CI中独立执行）
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;