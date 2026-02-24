#!/usr/bin/env bash
# Creates the TOUR_DATA KV namespaces (prod + dev) and updates wrangler.jsonc with the real IDs.
# Run from the repo root: bash scripts/create-tour-data-kv.sh

set -euo pipefail

WRANGLER="pnpm --filter @valguide/app exec wrangler"
WRANGLER_CONFIG="apps/app/wrangler.jsonc"

echo "==> Creating TOUR_DATA KV namespace (production)..."
PROD_OUTPUT=$($WRANGLER kv namespace create TOUR_DATA 2>&1)
echo "$PROD_OUTPUT"
PROD_ID=$(echo "$PROD_OUTPUT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROD_ID" ]; then
  echo "ERROR: Failed to extract production KV namespace ID"
  exit 1
fi
echo "    Production ID: $PROD_ID"

echo ""
echo "==> Creating TOUR_DATA KV namespace (dev)..."
DEV_OUTPUT=$($WRANGLER kv namespace create TOUR_DATA --env dev 2>&1)
echo "$DEV_OUTPUT"
DEV_ID=$(echo "$DEV_OUTPUT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEV_ID" ]; then
  echo "ERROR: Failed to extract dev KV namespace ID"
  exit 1
fi
echo "    Dev ID: $DEV_ID"

echo ""
echo "==> Updating $WRANGLER_CONFIG with real IDs..."

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/TODO_PROD_KV_ID/$PROD_ID/" "$WRANGLER_CONFIG"
  sed -i '' "s/TODO_DEV_KV_ID/$DEV_ID/" "$WRANGLER_CONFIG"
else
  sed -i "s/TODO_PROD_KV_ID/$PROD_ID/" "$WRANGLER_CONFIG"
  sed -i "s/TODO_DEV_KV_ID/$DEV_ID/" "$WRANGLER_CONFIG"
fi

echo "==> Done! Updated $WRANGLER_CONFIG:"
grep -A1 "TOUR_DATA" "$WRANGLER_CONFIG"

echo ""
echo "==> Next steps:"
echo "    1. Run 'pnpm --filter @valguide/app cf-typegen' to regenerate worker-configuration.d.ts"
echo "    2. Delete apps/app/src/cloudflare-kv.d.ts (no longer needed after typegen)"
echo "    3. Commit the changes"
