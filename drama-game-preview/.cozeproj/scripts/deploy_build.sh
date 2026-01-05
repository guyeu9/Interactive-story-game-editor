#!/bin/bash
set -e

echo "Cleaning previous build artifacts..."
rm -rf node_modules .next tsconfig.tsbuildinfo

echo "Pruning pnpm store cache..."
pnpm store prune

echo "Installing all dependencies for build..."
pnpm install

echo "Building for production..."
pnpm run build

echo "Cleaning up..."
# 清理 .next/cache 减小构建产物
rm -rf .next/cache

echo "Deploy build completed."
echo "Final project size: $(du -sh . | cut -f1)"
