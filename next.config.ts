import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
    output: 'export', // 开启静态导出，必须加！
  basePath: '/2026-blog-public', // 和你的仓库名完全一致，前后不加斜杠
  assetPrefix: '/2026-blog-public/', // 静态资源前缀，前后加斜杠
  trailingSlash: true, // 可选，优化路由
};

export default nextConfig;
