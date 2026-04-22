#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-build-apps-section.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_section() {
  local output_file status
  output_file=$(mktemp)
  status=0
  if ! (
    cd "$REPO_ROOT"
    GITHUB_OUTPUT="$output_file" "$@" bash "$SCRIPT"
  ) >/dev/null 2>&1; then
    status=$?
  fi
  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Includes selected app statuses and urls"
RESULT=$(run_section env DEPLOY_ENVIRONMENT=prod DEPLOY_APP=true RESULT_APP=success DEPLOY_WORKERS=true RESULT_WORKERS=failure)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
OUT=$(cat "$OUTFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "app success line" "$OUT" "- ✅ App — https://app.valguide.com"
assert_contains "workers failure line" "$OUT" "- ❌ Workers"
assert_not_contains "no studio line" "$OUT" "Studio"
echo ""

print_results
