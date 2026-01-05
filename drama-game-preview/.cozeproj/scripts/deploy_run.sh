#!/bin/bash
set -e

echo "Starting production server on port 5000..."
NODE_ENV=production PORT=5000 HOSTNAME=0.0.0.0 pnpm run start
