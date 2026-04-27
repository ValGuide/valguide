#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/configure-app-deploy.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_configure() {
  local output_file env_file log_file status
  output_file=$(mktemp)
  env_file=$(mktemp)
  log_file=$(mktemp)
  set +e
  (
    cd "$REPO_ROOT"
    GITHUB_OUTPUT="$output_file" \
    GITHUB_ENV="$env_file" \
    "$@" \
    bash "$SCRIPT"
  ) >"$log_file" 2>&1
  status=$?
  set -e
  cat "$log_file"
  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
  echo "__ENV_FILE__=$env_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

strip_meta() {
  echo "$1" | sed '/^__STATUS__=/d; /^__OUTPUT_FILE__=/d; /^__ENV_FILE__=/d'
}

echo "Test 1: App prod config writes full env"
RESULT=$(run_configure env APP_NAME=app DEPLOY_ENVIRONMENT=prod POSTHOG_PROJECT_KEY=ph-prod VITE_POSTHOG_HOST=https://e.example.com VITE_APP_DOMAIN=app.example.com VITE_PRIVACY_POLICY_URL=https://www.example.com/privacy VITE_TERMS_OF_SERVICE_URL=https://www.example.com/terms VITE_STUDIO_URL=https://studio.example.com VITE_R2_PUBLIC_URL=https://assets.example.com)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
ENVFILE=$(extract_field "$RESULT" "__ENV_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "url output" "$OUTFILE" "url=https://app.valguide.com"
assert_file_contains "posthog enabled" "$ENVFILE" "VITE_POSTHOG_ENABLED=true"
assert_file_contains "prod key" "$ENVFILE" "VITE_POSTHOG_KEY=ph-prod"
assert_file_contains "studio url" "$ENVFILE" "VITE_STUDIO_URL=https://studio.example.com"
assert_file_contains "vite env" "$ENVFILE" "VITE_ENV=prod"
echo ""

echo "Test 2: Docs dev config skips PostHog"
RESULT=$(run_configure env APP_NAME=docs DEPLOY_ENVIRONMENT=dev POSTHOG_PROJECT_KEY=ph-dev)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
ENVFILE=$(extract_field "$RESULT" "__ENV_FILE__")
ENVCONTENT=$(cat "$ENVFILE")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "docs url" "$OUTFILE" "url=https://docs-dev.val.guide"
assert_not_contains "no posthog enabled" "$ENVCONTENT" "VITE_POSTHOG_ENABLED"
assert_file_contains "dev env only" "$ENVFILE" "VITE_ENV=dev"
echo ""

echo "Test 3: Missing PostHog key fails for app"
RESULT=$(run_configure env APP_NAME=app DEPLOY_ENVIRONMENT=dev VITE_POSTHOG_HOST=https://e.example.com VITE_APP_DOMAIN=app.example.com VITE_PRIVACY_POLICY_URL=https://www.example.com/privacy VITE_TERMS_OF_SERVICE_URL=https://www.example.com/terms VITE_STUDIO_URL=https://studio.example.com VITE_R2_PUBLIC_URL=https://assets.example.com)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOG=$(strip_meta "$RESULT")
assert_exit_code "failure" "$STATUS" "1"
assert_contains "missing key error" "$LOG" "Missing PostHog key for app-dev"
echo ""

print_results
