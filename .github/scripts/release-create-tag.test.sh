#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-create-tag.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_with_git_stub() {
  local tmp_dir stub_dir log_file output_file status
  tmp_dir=$(make_temp_dir)
  stub_dir="$tmp_dir/bin"
  mkdir -p "$stub_dir"
  log_file="$tmp_dir/git.log"
  output_file="$tmp_dir/out"

  cat >"$stub_dir/git" <<EOF
#!/usr/bin/env bash
echo "\$*" >> "$log_file"
EOF
  chmod +x "$stub_dir/git"

  status=0
  if ! PATH="$stub_dir:$PATH" GITHUB_OUTPUT="$output_file" "$@" bash "$SCRIPT" >/dev/null 2>&1; then
    status=$?
  fi

  echo "__STATUS__=$status"
  echo "__LOG_FILE__=$log_file"
  echo "__OUTPUT_FILE__=$output_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Creates and pushes expected semver tag"
RESULT=$(run_with_git_stub env RELEASE_TAG=v1.2.3)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
LOG=$(cat "$LOGFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "tag output" "$(cat "$OUTFILE")" "tag=v1.2.3"
assert_contains "git tag call" "$LOG" "tag -a v1.2.3 -m Release v1.2.3"
assert_contains "git push call" "$LOG" "push origin v1.2.3"
echo ""

print_results
