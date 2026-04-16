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
PROD_PLACEHOLDER="TODO_PROD_AUTH_KV_ID"
DEV_PLACEHOLDER="TODO_DEV_AUTH_KV_ID"

require_cloudflare_auth() {
  if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    return 0
  fi

  echo "ERROR: CLOUDFLARE_API_TOKEN is not set."
  echo "Set a Cloudflare API token with KV namespace permissions, then rerun this script."
  exit 1
}

extract_namespace_id() {
  local output="$1"
  echo "$output" | sed -n 's/.*"id": "\([^"]*\)".*/\1/p' | head -1
}

create_namespace() {
  local env_name="$1"
  local env_flag=""

  if [[ "$env_name" == "dev" ]]; then
    env_flag="--env dev"
  fi

  echo "==> Creating AUTH_KV namespace (${env_name})..." >&2

  set +e
  local output
  output=$($WRANGLER kv namespace create AUTH_KV $env_flag 2>&1)
  local status=$?
  set -e

  echo "$output" >&2

  if [[ "$status" -ne 0 ]]; then
    exit "$status"
  fi

  local id
  id=$(extract_namespace_id "$output")

  if [[ -z "$id" ]]; then
    echo "ERROR: Failed to extract ${env_name} KV namespace ID"
    exit 1
  fi

  echo "    ${env_name} ID: $id" >&2
  echo "$id"
}

replace_placeholder() {
  local file="$1"
  local placeholder="$2"
  local value="$3"

  if ! grep -q "$placeholder" "$file"; then
    echo "ERROR: Placeholder $placeholder not found in $file"
    echo "This usually means the file was already updated or the placeholder changed."
    exit 1
  fi

  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/$placeholder/$value/g" "$file"
  else
    sed -i "s/$placeholder/$value/g" "$file"
  fi
}

require_cloudflare_auth

PROD_ID=$(create_namespace "production")

echo ""
DEV_ID=$(create_namespace "dev")

echo ""
echo "==> Updating Wrangler configs..."
for config in "${WRANGLER_CONFIGS[@]}"; do
  replace_placeholder "$config" "$PROD_PLACEHOLDER" "$PROD_ID"
  replace_placeholder "$config" "$DEV_PLACEHOLDER" "$DEV_ID"
  echo "    Updated $config"
done

echo ""
echo "==> Next steps:"
echo "    1. Run 'pnpm --filter @valguide/app cf-typegen'"
echo "    2. Run 'pnpm --filter @valguide/studio cf-typegen'"
echo "    3. Run 'pnpm --filter @valguide/admin cf-typegen'"
echo "    4. Run 'pnpm --filter @valguide/www cf-typegen'"
echo "    5. Commit the updated bindings and type files"
