#!/bin/bash
set -e

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 禁用 npm，强制使用 pnpm
export npm_config_user_agent=pnpm
export npm_config_registry=https://registry.npmmirror.com
export PATH="$SCRIPT_DIR:$PATH"
export CI=true

echo "Cleaning previous build artifacts..."
cd "$PROJECT_ROOT"
rm -rf node_modules .next tsconfig.tsbuildinfo

echo "Pruning pnpm store cache..."
pnpm store prune

echo "Installing all dependencies for build..."
pnpm install --prefer-offline --no-frozen-lockfile

echo "Building for production..."
pnpm run build

echo "Cleaning up for minimal deployment..."
# 删除所有不必要的文件，最小化构建产物
rm -rf .next/cache
rm -rf .next/trace*

# 使用 standalone 模式，删除完整的 node_modules
if [ -d ".next/standalone" ]; then
  echo "Standalone build detected, creating minimal deployment..."

  # 删除完整的 node_modules（替换为 standalone 版本）
  rm -rf node_modules

  # 删除源代码（生产环境不需要）
  rm -rf src

  # 删除开发配置文件
  rm -f eslint.config.mjs tsconfig.json postcss.config.mjs next-env.d.ts
  rm -f .npmrc

  # 删除文档文件
  rm -f README.md GUIDE.md QUICK_START.md EXAMPLES.md PROJECT_EXPORT.md

  # 删除 package-lock.json（保留 pnpm-lock.yaml）
  rm -f package-lock.json

  # 删除 npm-wrapper.sh（生产环境不需要）
  rm -f .cozeproj/scripts/npm-wrapper.sh

  # 只保留必要的部署脚本
  echo "Removed development files and source code"
  echo "Node modules replaced with standalone version"
else
  echo "Warning: Standalone build not found"
fi

echo "Deploy build completed."
echo "Final project size: $(du -sh . | cut -f1)"
echo "Standalone directory size: $(du -sh .next/standalone 2>/dev/null | cut -f1 || echo 'N/A')"
