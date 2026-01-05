#!/bin/bash
set -e

echo "Starting dev server on port 5000..."
pnpm run dev -- --port 5000 --host 0.0.0.0
