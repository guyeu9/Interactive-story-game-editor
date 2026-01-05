#!/bin/bash
set -e

echo "Starting production server on port 5000..."
pnpm run start -- --port 5000 --host 0.0.0.0
