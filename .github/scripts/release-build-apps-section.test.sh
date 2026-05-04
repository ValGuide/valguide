#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-build-apps-section.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_section() {
  local output_file status
  output_file=$(mktemp)
  set +e
  (
    cd "$REPO_ROOT"
    GITHUB_OUTPUT="$output_file" "$@" bash "$SCRIPT"
  ) >/dev/null 2>&1
  status=$?
  set -e
  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Renders deploy manifest targets"
MANIFEST='{"targets":[{"name":"studio","display":"Studio","url":"https://studio.valguide.dev","result":"success"},{"name":"workers","display":"Workers","url":"","result":"failure"}]}'
RESULT=$(run_section env DEPLOY_MANIFEST="$MANIFEST")
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
OUT=$(cat "$OUTFILE")
assert_exit_code "manifest success" "$STATUS" "0"
assert_contains "manifest studio success line" "$OUT" "- ✅ Studio — https://studio.valguide.dev"
assert_contains "manifest workers failure line" "$OUT" "- ❌ Workers"
echo ""

echo "Test 2: Missing manifest fails"
RESULT=$(run_section env)
STATUS=$(extract_field "$RESULT" "__STATUS__")
assert_exit_code "missing manifest failure" "$STATUS" "1"
echo ""

print_results
