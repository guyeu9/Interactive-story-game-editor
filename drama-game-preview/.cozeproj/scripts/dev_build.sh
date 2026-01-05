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

echo "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile

echo "Dev build completed."
