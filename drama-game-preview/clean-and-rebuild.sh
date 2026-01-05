#!/bin/bash
# 构建优化脚本 - 清理缓存并重新构建

set -e

echo "========================================="
echo "  剧情织造机 - 构建优化脚本"
echo "========================================="
echo ""

# 1. 清理 pnpm 缓存
echo "🧹 步骤 1/4: 清理 pnpm 缓存..."
pnpm store prune
echo "✓ pnpm 缓存已清理"
echo ""

# 2. 清理构建产物
echo "🧹 步骤 2/4: 清理构建产物和缓存..."
rm -rf .next
rm -rf node_modules
rm -f tsconfig.tsbuildinfo
rm -f pnpm-lock.yaml
echo "✓ 已删除: .next, node_modules, tsconfig.tsbuildinfo, pnpm-lock.yaml"
echo ""

# 3. 重新安装依赖
echo "📦 步骤 3/4: 重新安装依赖..."
pnpm install
echo "✓ 依赖安装完成"
echo ""

# 4. 执行构建
echo "🔨 步骤 4/4: 执行生产构建..."
pnpm run build
echo ""

echo "========================================="
echo "✅ 构建优化完成！"
echo "========================================="
echo ""
echo "构建产物统计:"
du -sh .next 2>/dev/null || echo "  .next 目录为空"
du -sh node_modules 2>/dev/null || echo "  node_modules 目录为空"
echo ""
