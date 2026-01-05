import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 减小构建产物大小
  output: 'standalone', // 启用 standalone 模式，只打包必要的依赖
  webpack: (config, { isServer }) => {
    // 生产环境下移除一些不必要的文件
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
};

export default nextConfig;
