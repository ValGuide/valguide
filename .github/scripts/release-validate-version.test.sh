#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-validate-version.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_validate() {
  local tmp_dir output_file log_file status
  tmp_dir=$(make_temp_dir)
  output_file="$tmp_dir/out"
  log_file="$tmp_dir/log"

  status=0
  GITHUB_OUTPUT="$output_file" "$@" bash "$SCRIPT" >"$log_file" 2>&1 || status=$?

  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
  echo "__LOG_FILE__=$log_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Adds v prefix to plain semver"
RESULT=$(run_validate env RELEASE_VERSION=1.2.3)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "writes tag output" "$OUTFILE" "tag=v1.2.3"
echo ""

echo "Test 2: Keeps existing v prefix and prerelease"
RESULT=$(run_validate env RELEASE_VERSION=v1.2.3-rc.1)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "writes prerelease tag output" "$OUTFILE" "tag=v1.2.3-rc.1"
echo ""

echo "Test 3: Rejects invalid version"
RESULT=$(run_validate env RELEASE_VERSION=latest)
STATUS=$(extract_field "$RESULT" "__STATUS__")
LOGFILE=$(extract_field "$RESULT" "__LOG_FILE__")
assert_exit_code "failure" "$STATUS" "1"
assert_file_contains "logs validation error" "$LOGFILE" "Release version must be semver"
echo ""

print_results
