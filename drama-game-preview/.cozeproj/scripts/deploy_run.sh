#!/bin/bash
set -e

echo "Starting production server on port 5000..."
cd "$(dirname "$0")/../.."

# 使用 standalone 模式启动
if [ -f ".next/standalone/server.js" ]; then
  echo "Using standalone server..."
  NODE_ENV=production PORT=5000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
else
  echo "Using default server..."
  NODE_ENV=production PORT=5000 HOSTNAME=0.0.0.0 pnpm run start
fi
