#!/usr/bin/env bash
# Creates the AUTH_KV KV namespaces (prod + dev) and updates Wrangler configs with the real IDs.
# Run from the repo root: bash scripts/create-auth-kv.sh

set -euo pipefail

WRANGLER="pnpm --filter @valguide/app exec wrangler"
WRANGLER_CONFIGS=(
  "apps/app/wrangler.jsonc"
  "apps/studio/wrangler.jsonc"
  "apps/admin/wrangler.jsonc"
  "apps/www/wrangler.jsonc"
)

echo "==> Creating AUTH_KV namespace (production)..."
set +e
PROD_OUTPUT=$($WRANGLER kv namespace create AUTH_KV 2>&1)
PROD_STATUS=$?
set -e
echo "$PROD_OUTPUT"
if [ "$PROD_STATUS" -ne 0 ]; then
  exit "$PROD_STATUS"
fi
PROD_ID=$(echo "$PROD_OUTPUT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROD_ID" ]; then
  echo "ERROR: Failed to extract production KV namespace ID"
  exit 1
fi
echo "    Production ID: $PROD_ID"

echo ""
echo "==> Creating AUTH_KV namespace (dev)..."
set +e
DEV_OUTPUT=$($WRANGLER kv namespace create AUTH_KV --env dev 2>&1)
DEV_STATUS=$?
set -e
echo "$DEV_OUTPUT"
if [ "$DEV_STATUS" -ne 0 ]; then
  exit "$DEV_STATUS"
fi
DEV_ID=$(echo "$DEV_OUTPUT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEV_ID" ]; then
  echo "ERROR: Failed to extract dev KV namespace ID"
  exit 1
fi
echo "    Dev ID: $DEV_ID"

echo ""
echo "==> Updating Wrangler configs..."
for config in "${WRANGLER_CONFIGS[@]}"; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/TODO_PROD_AUTH_KV_ID/$PROD_ID/g" "$config"
    sed -i '' "s/TODO_DEV_AUTH_KV_ID/$DEV_ID/g" "$config"
  else
    sed -i "s/TODO_PROD_AUTH_KV_ID/$PROD_ID/g" "$config"
    sed -i "s/TODO_DEV_AUTH_KV_ID/$DEV_ID/g" "$config"
  fi
  echo "    Updated $config"
done

echo ""
echo "==> Next steps:"
echo "    1. Run app/studio/admin/www worker type generation if you want regenerated Wrangler types"
echo "    2. Commit the updated bindings and type files"
