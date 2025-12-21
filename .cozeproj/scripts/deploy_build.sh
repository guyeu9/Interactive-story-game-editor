#!/bin/bash
set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$WORK_DIR/drama-game-preview"

echo "开始构建剧情织造机项目..."
echo "当前目录: $(pwd)"

# 清理旧的构建文件
if [ -d ".next" ]; then
  echo "清理旧的构建文件..."
  rm -rf .next
fi

# 安装依赖
echo "安装依赖..."
npm install

# 使用webpack构建（避免turbopack问题）
echo "开始构建项目..."
npx next build --webpack

echo "构建完成！"