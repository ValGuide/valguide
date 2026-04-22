#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$SCRIPT_DIR/check-deploy.sh"
source "$SCRIPT_DIR/test-helpers.sh"

run_script() {
  local tmp output_file status
  tmp=$(mktemp)
  output_file=$(mktemp)
  set +e
  GITHUB_OUTPUT="$tmp" "$@" bash "$SCRIPT" >"$output_file" 2>&1
  status=$?
  set -e
  cat "$output_file"
  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$tmp"
}

extract_status() {
  echo "$1" | awk -F= '/^__STATUS__=/{print $2}'
}

extract_output_file() {
  echo "$1" | awk -F= '/^__OUTPUT_FILE__=/{print $2}'
}

strip_meta() {
  echo "$1" | sed '/^__STATUS__=/d; /^__OUTPUT_FILE__=/d'
}

echo "Test 1: Push build all on main deploys prod everywhere"
RESULT=$(run_script env GITHUB_REF=refs/heads/main COMMIT_MSG='release: go [build all]')
STATUS=$(extract_status "$RESULT")
OUTFILE=$(extract_output_file "$RESULT")
LOG=$(strip_meta "$RESULT")
assert_exit_code "success" "$STATUS" "0"
assert_contains "logs build all" "$LOG" "[build all] found"
assert_file_contains "sets prod env" "$OUTFILE" "environment=prod"
assert_file_contains "deploy app true" "$OUTFILE" "deploy-app=true"
assert_file_contains "deploy workers true" "$OUTFILE" "deploy-workers=true"
assert_file_contains "any deploy true" "$OUTFILE" "any-deploy=true"
echo ""

echo "Test 2: Push scoped build on dev deploys selected apps only"
RESULT=$(run_script env GITHUB_REF=refs/heads/dev COMMIT_MSG='fix: one thing [build studio,www]')
STATUS=$(extract_status "$RESULT")
OUTFILE=$(extract_output_file "$RESULT")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "sets dev env" "$OUTFILE" "environment=dev"
assert_file_contains "studio true" "$OUTFILE" "deploy-studio=true"
assert_file_contains "www true" "$OUTFILE" "deploy-www=true"
assert_file_contains "app false" "$OUTFILE" "deploy-app=false"
assert_file_contains "workers false" "$OUTFILE" "deploy-workers=false"
echo ""

echo "Test 3: No build tag disables deploy"
RESULT=$(run_script env GITHUB_REF=refs/heads/dev COMMIT_MSG='docs: update readme')
STATUS=$(extract_status "$RESULT")
OUTFILE=$(extract_output_file "$RESULT")
LOG=$(strip_meta "$RESULT")
assert_exit_code "success" "$STATUS" "0"
assert_contains "logs no deploy" "$LOG" "No [build] tag found"
assert_file_contains "any deploy false" "$OUTFILE" "any-deploy=false"
assert_file_contains "app false" "$OUTFILE" "deploy-app=false"
echo ""

echo "Test 4: Manual apps excludes workers"
RESULT=$(run_script env MANUAL_ENVIRONMENT=prod MANUAL_SCOPE=apps)
STATUS=$(extract_status "$RESULT")
OUTFILE=$(extract_output_file "$RESULT")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "manual prod env" "$OUTFILE" "environment=prod"
assert_file_contains "app true" "$OUTFILE" "deploy-app=true"
assert_file_contains "workers false" "$OUTFILE" "deploy-workers=false"
echo ""

echo "Test 5: Manual scoped list supports build syntax"
RESULT=$(run_script env MANUAL_ENVIRONMENT=dev MANUAL_SCOPE='[build admin, links]')
STATUS=$(extract_status "$RESULT")
OUTFILE=$(extract_output_file "$RESULT")
assert_exit_code "success" "$STATUS" "0"
assert_file_contains "admin true" "$OUTFILE" "deploy-admin=true"
assert_file_contains "links true" "$OUTFILE" "deploy-links=true"
assert_file_contains "studio false" "$OUTFILE" "deploy-studio=false"
echo ""

echo "Test 6: Manual invalid scope fails"
RESULT=$(run_script env MANUAL_ENVIRONMENT=dev MANUAL_SCOPE='app nope')
STATUS=$(extract_status "$RESULT")
LOG=$(strip_meta "$RESULT")
assert_exit_code "failure" "$STATUS" "1"
assert_contains "reports invalid scope" "$LOG" "Unknown manual deploy scope(s): nope"
echo ""

print_results
