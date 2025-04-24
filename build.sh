#!/bin/bash
set -e

# Remove existing node_modules and package locks
rm -rf node_modules 
rm -f package-lock.json
rm -f pnpm-lock.yaml

# Install dependencies with npm instead of pnpm
npm install --no-optional

# Build the project
npm run build

echo "Build completed successfully!" 