#!/usr/bin/env bash
# scripts/cms-export.sh
# Export Strapi CMS configuration and content-type definitions
# Usage: ./scripts/cms-export.sh

set -euo pipefail

# Compose files (adjust if your paths differ)
BASE_COMPOSE="../compose/compose.base.yml"
DEV_COMPOSE="../compose/compose.dev.yml"
SERVICE="cms"

# Find the running CMS container ID
CONTAINER_ID=$(docker compose -f "$BASE_COMPOSE" -f "$DEV_COMPOSE" ps -q "$SERVICE")

if [ -z "$CONTAINER_ID" ]; then
  echo "❌ CMS container not found. Start it with:"
  echo "   docker compose -f $BASE_COMPOSE -f $DEV_COMPOSE up -d $SERVICE"
  exit 1
fi

# Paths in the container
CONTAINER_CONFIG="/srv/app/config"
CONTAINER_SRC="/srv/app/src"

# Paths on the host
HOST_CONFIG="../apps/cms/config"
HOST_SRC="../apps/cms/src"

echo "🔄 Exporting config..."
mkdir -p "$HOST_CONFIG"
docker cp "${CONTAINER_ID}:${CONTAINER_CONFIG}" "$HOST_CONFIG"

echo "🔄 Exporting content-types..."
mkdir -p "$HOST_SRC"
docker cp "${CONTAINER_ID}:${CONTAINER_SRC}" "$HOST_SRC"

echo "✅ Export complete!"
echo "Now commit your updates:"
echo "  git add $HOST_CONFIG $HOST_SRC"
echo "  git commit -m \"chore(cms): export updated Strapi config and content-types\""