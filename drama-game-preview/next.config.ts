import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 减小构建产物大小
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
