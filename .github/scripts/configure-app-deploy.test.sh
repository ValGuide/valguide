#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/configure-app-deploy.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_configure() {
  local output_file log_file status
  output_file=$(mktemp)
  log_file=$(mktemp)
  set +e
  (
    cd "$REPO_ROOT"
    GITHUB_OUTPUT="$output_file" \
    "$@" \
    bash "$SCRIPT"
  ) >"$log_file" 2>&1
  status=$?
  set -e
  cat "$log_file"
  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

strip_meta() {
  echo "$1" | sed '/^__STATUS__=/d; /^__OUTPUT_FILE__=/d'
}

write_app_env() {
  local env_file=$1
  cat >"$env_file" <<'EOF'
POSTHOG_PROJECT_KEY='ph-prod'
VITE_POSTHOG_HOST='https://e.example.com'
VITE_APP_DOMAIN='app.example.com'
VITE_PRIVACY_POLICY_URL='https://www.example.com/privacy'
VITE_TERMS_OF_SERVICE_URL='https://www.example.com/terms'
VITE_STUDIO_URL='https://studio.example.com'
VITE_R2_PUBLIC_URL='https://assets.example.com'
EOF
}

write_empty_env() {
  local env_file=$1
  : >"$env_file"
}

echo "Test 1: App prod config validates and writes URL output"
DEPLOY_ENV_FILE=$(mktemp)
write_app_env "$DEPLOY_ENV_FILE"
RESULT=$(run_configure env APP_NAME=app DEPLOY_ENVIRONMENT=prod DEPLOY_ENV_FILE="$DEPLOY_ENV_FILE")
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "url output" "$OUTFILE" "url=https://app.valguide.com"
echo ""

echo "Test 2: Docs dev config skips PostHog"
DEPLOY_ENV_FILE=$(mktemp)
write_empty_env "$DEPLOY_ENV_FILE"
RESULT=$(run_configure env APP_NAME=docs DEPLOY_ENVIRONMENT=dev DEPLOY_ENV_FILE="$DEPLOY_ENV_FILE")
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "docs url" "$OUTFILE" "url=https://docs-dev.val.guide"
echo ""

echo "Test 3: Missing PostHog key fails for app"
DEPLOY_ENV_FILE=$(mktemp)
write_empty_env "$DEPLOY_ENV_FILE"
RESULT=$(run_configure env APP_NAME=app DEPLOY_ENVIRONMENT=dev DEPLOY_ENV_FILE="$DEPLOY_ENV_FILE")
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOG=$(strip_meta "$RESULT")
assert_exit_code "failure" "$STATUS" "1"
assert_contains "missing key error" "$LOG" "Missing PostHog key for app-dev"
echo ""

echo "Test 4: Sourceable function exports build env in current shell"
DEPLOY_ENV_FILE=$(mktemp)
write_app_env "$DEPLOY_ENV_FILE"
RESULT=$(
  cd "$REPO_ROOT"
  DEPLOY_ENV_FILE="$DEPLOY_ENV_FILE" bash -c '
    set -euo pipefail
    source .github/scripts/configure-app-deploy.sh
    load_deploy_env
    configure_app_deploy_env app prod
    printf "%s\n" "$VITE_POSTHOG_ENABLED" "$VITE_POSTHOG_KEY" "$VITE_STUDIO_URL" "$VITE_ENV"
  '
)
assert_contains "posthog enabled export" "$RESULT" "true"
assert_contains "posthog key export" "$RESULT" "ph-prod"
assert_contains "studio url export" "$RESULT" "https://studio.example.com"
assert_contains "vite env export" "$RESULT" "prod"
echo ""

print_results
