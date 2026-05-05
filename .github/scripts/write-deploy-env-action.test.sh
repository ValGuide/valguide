#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ACTION="$REPO_ROOT/.github/actions/write-deploy-env/index.js"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

TMP_DIR=$(make_temp_dir)
OUTPUT_FILE="$TMP_DIR/github-output"
LOG_FILE="$TMP_DIR/action.log"

GITHUB_OUTPUT="$OUTPUT_FILE" \
RUNNER_TEMP="$TMP_DIR" \
DEPLOY_VARS_JSON='{"APP_WORKER_NAME":"fake-worker","APP_ROUTES":"app.example.com"}' \
env \
  'INPUT_CLOUDFLARE-API-TOKEN=fake-token' \
  node "$ACTION" >"$LOG_FILE"

ENV_FILE=$(awk -F= '$1=="env-file" {print $2}' "$OUTPUT_FILE")
MODE=$(stat -f '%Lp' "$ENV_FILE")
CONTENT=$(cat "$ENV_FILE")
LOG=$(cat "$LOG_FILE")

echo "Test 1: Action writes chmod 0600 env file"
assert_equals "env file mode" "$MODE" "600"
assert_contains "token assignment" "$CONTENT" "CLOUDFLARE_API_TOKEN='fake-token'"
assert_contains "worker assignment" "$CONTENT" "APP_WORKER_NAME='fake-worker'"
assert_contains "route assignment" "$CONTENT" "APP_ROUTES='app.example.com'"
echo ""

echo "Test 2: Action masks values before logging status"
assert_contains "token mask command" "$LOG" "::add-mask::fake-token"
assert_contains "worker mask command" "$LOG" "::add-mask::fake-worker"
assert_not_contains "status does not include token" "$(tail -n 1 "$LOG_FILE")" "fake-token"
echo ""

print_results
