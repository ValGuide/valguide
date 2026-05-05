#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-verify-ci.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_with_stubs() {
  local fixture=$1
  shift
  local tmp_dir stub_dir log_file status
  tmp_dir=$(make_temp_dir)
  stub_dir="$tmp_dir/bin"
  log_file="$tmp_dir/log"
  mkdir -p "$stub_dir"

  cat >"$stub_dir/gh" <<EOF
#!/usr/bin/env bash
cat <<'JSON'
$fixture
JSON
EOF
  chmod +x "$stub_dir/gh"

  status=0
  PATH="$stub_dir:$PATH" "$@" bash "$SCRIPT" >"$log_file" 2>&1 || status=$?

  echo "__STATUS__=$status"
  echo "__LOG_FILE__=$log_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

SUCCESS_JSON='[{"conclusion":"success","databaseId":1,"headSha":"abc123","name":"CI","url":"https://example.com/run/1"}]'
FAIL_JSON='[]'

echo "Test 1: Accepts successful required workflow"
RESULT=$(run_with_stubs "$SUCCESS_JSON" env TARGET_SHA=abc123 GITHUB_REPOSITORY=openai/test REQUIRED_WORKFLOW=CI)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "logs verified workflow" "$LOGFILE" "Verified required workflow"
echo ""

echo "Test 2: Rejects missing successful run"
RESULT=$(run_with_stubs "$FAIL_JSON" env TARGET_SHA=abc123 GITHUB_REPOSITORY=openai/test REQUIRED_WORKFLOW=CI)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "failure" "$STATUS" "1"
assert_file_contains "logs missing workflow" "$LOGFILE" "has no successful run"
echo ""

print_results
