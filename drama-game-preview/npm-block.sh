#!/bin/bash
# npm 包装器 - 强制使用 pnpm
echo "⚠️  npm command is blocked in this project"
echo "📦 Please use 'pnpm' instead"
echo "🔄 Redirecting to pnpm..."
exec pnpm "$@"
