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

echo "Cleaning up..."
# 清理 .next/cache 减小构建产物
rm -rf .next/cache

echo "Deploy build completed."
echo "Final project size: $(du -sh . | cut -f1)"
