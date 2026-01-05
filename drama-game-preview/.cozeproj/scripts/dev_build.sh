#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Dev build completed."
