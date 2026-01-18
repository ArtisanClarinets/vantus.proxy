#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install

echo "Generating Prisma Client..."
# Needs DATABASE_URL placeholder
DATABASE_URL="mysql://dummy" pnpm --filter database generate

echo "Setup complete. Run 'cd infra/docker && docker compose up --build'"
