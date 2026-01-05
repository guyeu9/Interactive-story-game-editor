#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building for production..."
pnpm run build

echo "Deploy build completed."
