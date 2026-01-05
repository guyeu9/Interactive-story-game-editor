#!/bin/bash
set -e

echo "Cleaning previous build artifacts..."
rm -rf node_modules .next tsconfig.tsbuildinfo

echo "Installing production dependencies only..."
pnpm install --prod

echo "Building for production..."
pnpm run build

echo "Cleaning up..."
# 清理 .next/cache 减小构建产物
rm -rf .next/cache

echo "Deploy build completed."
echo "Final project size: $(du -sh . | cut -f1)"
