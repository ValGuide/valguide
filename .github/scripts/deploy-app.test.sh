#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/deploy-app.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_with_stub() {
  local tmp_dir stub_dir log_file env_file status
  tmp_dir=$(make_temp_dir)
  stub_dir="$tmp_dir/bin"
  mkdir -p "$stub_dir"
  log_file="$tmp_dir/pnpm.log"
  env_file="$tmp_dir/deploy-env.sh"
  cat >"$env_file" <<'EOF'
POSTHOG_PROJECT_KEY='ph-test'
VITE_POSTHOG_HOST='https://e.example.com'
VITE_APP_DOMAIN='app.example.com'
VITE_PRIVACY_POLICY_URL='https://www.example.com/privacy'
VITE_TERMS_OF_SERVICE_URL='https://www.example.com/terms'
VITE_STUDIO_URL='https://studio.example.com'
VITE_R2_PUBLIC_URL='https://assets.example.com'
EOF
  cat >"$stub_dir/pnpm" <<EOF
#!/usr/bin/env bash
echo "\$*" >> "$log_file"
EOF
  chmod +x "$stub_dir/pnpm"

  set +e
  PATH="$stub_dir:$PATH" DEPLOY_ENV_FILE="$env_file" "$@" bash "$SCRIPT" >/dev/null 2>&1
  status=$?
  set -e

  echo "__STATUS__=$status"
  echo "__LOG_FILE__=$log_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Prod uses deploy"
RESULT=$(run_with_stub env APP_NAME=studio DEPLOY_ENVIRONMENT=prod)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "prod deploy command" "$LOGFILE" '--filter @valguide/studio run deploy'
echo ""

echo "Test 2: Dev uses deploy:dev"
RESULT=$(run_with_stub env APP_NAME=app DEPLOY_ENVIRONMENT=dev)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "dev deploy command" "$LOGFILE" '--filter @valguide/app run deploy:dev'
echo ""

print_results
