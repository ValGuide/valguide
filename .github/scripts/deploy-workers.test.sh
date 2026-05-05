#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/deploy-workers.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_workers() {
  local tmp_dir stub_dir log_file env_file status
  tmp_dir=$(make_temp_dir)
  mkdir -p "$tmp_dir/workers/alpha" "$tmp_dir/workers/beta" "$tmp_dir/bin"
  stub_dir="$tmp_dir/bin"
  log_file="$tmp_dir/pnpm.log"
  env_file="$tmp_dir/deploy-env.sh"
  : >"$env_file"

  cat >"$stub_dir/pnpm" <<EOF
#!/usr/bin/env bash
echo "\$*" >> "$log_file"
EOF
  chmod +x "$stub_dir/pnpm"

  set +e
  (
    cd "$tmp_dir"
    PATH="$stub_dir:$PATH" DEPLOY_ENV_FILE="$env_file" "$@" bash "$SCRIPT"
  ) >/dev/null 2>&1
  status=$?
  set -e

  echo "__STATUS__=$status"
  echo "__LOG_FILE__=$log_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Dev deploys all workers with deploy:dev"
RESULT=$(run_workers env DEPLOY_ENVIRONMENT=dev)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
LOG=$(cat "$LOGFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "alpha dev command" "$LOG" "--filter @valguide/alpha run deploy:dev"
assert_contains "beta dev command" "$LOG" "--filter @valguide/beta run deploy:dev"
echo ""

echo "Test 2: Prod deploys all workers with deploy"
RESULT=$(run_workers env DEPLOY_ENVIRONMENT=prod)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
LOG=$(cat "$LOGFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "alpha prod command" "$LOG" "--filter @valguide/alpha run deploy"
assert_contains "beta prod command" "$LOG" "--filter @valguide/beta run deploy"
assert_not_contains "no deploy dev" "$LOG" "deploy:dev"
echo ""

print_results
