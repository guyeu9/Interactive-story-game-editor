#!/bin/bash
set -e

echo "Starting dev server on port 5000..."
PORT=5000 HOSTNAME=0.0.0.0 pnpm run dev
