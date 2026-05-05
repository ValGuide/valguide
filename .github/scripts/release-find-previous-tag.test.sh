#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-find-previous-tag.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_in_repo() {
  local tmp_dir output_file log_file status
  tmp_dir=$(make_temp_dir)
  output_file="$tmp_dir/out"
  log_file="$tmp_dir/log"
  git init "$tmp_dir" >/dev/null 2>&1
  (
    cd "$tmp_dir"
    git config user.name test
    git config user.email test@example.com
    touch file
    git add file
    GIT_AUTHOR_DATE='2026-01-01T00:00:00Z' GIT_COMMITTER_DATE='2026-01-01T00:00:00Z' git commit -m "init" >/dev/null 2>&1
    git tag v1.0.0
    echo "next" > file
    git add file
    GIT_AUTHOR_DATE='2026-02-01T00:00:00Z' GIT_COMMITTER_DATE='2026-02-01T00:00:00Z' git commit -m "next" >/dev/null 2>&1
    git tag v1.1.0
    git tag v1.2.0-rc.1
  )
  status=0
  if ! (
    cd "$tmp_dir"
    GITHUB_OUTPUT="$output_file" "$@" bash "$SCRIPT"
  ) >"$log_file" 2>&1; then
    status=$?
  fi
  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
  echo "__LOG_FILE__=$log_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Finds latest semver tag"
RESULT=$(run_in_repo env RELEASE_TAG=v1.3.0)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "writes previous tag" "$OUTFILE" "tag=v1.2.0-rc.1"
assert_file_contains "logs previous tag" "$LOGFILE" "Found previous tag: v1.2.0-rc.1"
echo ""

echo "Test 2: Current tag is excluded"
RESULT=$(run_in_repo env RELEASE_TAG=v1.2.0-rc.1)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "writes previous tag" "$OUTFILE" "tag=v1.1.0"
assert_file_contains "logs previous tag" "$LOGFILE" "Found previous tag: v1.1.0"
echo ""

print_results
