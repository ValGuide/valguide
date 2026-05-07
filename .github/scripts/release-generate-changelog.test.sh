#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/release-generate-changelog.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_changelog() {
  local tmp_dir stub_dir output_file status
  tmp_dir=$(make_temp_dir)
  stub_dir="$tmp_dir/bin"
  mkdir -p "$stub_dir"
  output_file="$tmp_dir/out"

  cat >"$stub_dir/git" <<'EOF'
#!/usr/bin/env bash
if [ "$1" = "log" ]; then
  printf 'feat: add release button ([abc1234](https://example.com/commit/abc))\nfix: patch release notes ([def5678](https://example.com/commit/def))\n'
else
  exit 1
fi
EOF
  chmod +x "$stub_dir/git"

  status=0
  if ! (
    cd "$REPO_ROOT"
    PATH="$stub_dir:$PATH" \
    GITHUB_OUTPUT="$output_file" \
    "$@" \
    bash "$SCRIPT"
  ) >/dev/null 2>&1; then
    status=$?
  fi

  echo "__STATUS__=$status"
  echo "__OUTPUT_FILE__=$output_file"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: No previous tag writes compact first-release note"
RESULT=$(run_changelog env GITHUB_REPOSITORY=openai/test GITHUB_SERVER_URL=https://github.com)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
OUT=$(cat "$OUTFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "first release note" "$OUT" "First release; no previous semver tag to diff against."
echo ""

echo "Test 2: Previous tag builds categorized changelog"
RESULT=$(run_changelog env PREVIOUS_TAG=v1.0.0 GITHUB_REPOSITORY=openai/test GITHUB_SERVER_URL=https://github.com)
STATUS=$(extract_field "$RESULT" "__STATUS__")
OUTFILE=$(extract_field "$RESULT" "__OUTPUT_FILE__")
OUT=$(cat "$OUTFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "features heading" "$OUT" "### ✨ Features"
assert_contains "fixes heading" "$OUT" "### 🐛 Fixes"
assert_contains "feat item" "$OUT" "add release button"
assert_contains "fix item" "$OUT" "patch release notes"
echo ""

print_results
