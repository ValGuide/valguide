#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

git_init() {
  local repo="$1"
  mkdir -p "$repo"
  git -C "$repo" init -q
  git -C "$repo" config user.name "Valerius"
  git -C "$repo" config user.email "valerius@valguide.com"
}

commit_file() {
  local repo="$1"
  local message="$2"
  local file="$3"
  printf '%s\n' "$message" > "$repo/$file"
  git -C "$repo" add "$file"
  git -C "$repo" commit -q -m "$message"
}

run_plan() {
  local repo="$1"
  local output
  output="$(mktemp)"
  (cd "$repo" && GITHUB_OUTPUT="$output" bash "$SCRIPT_DIR/resolve-dev-release-plan.sh")
  cat "$output"
}

assert_output_contains() {
  local output="$1"
  local expected="$2"
  if ! grep -Fxq "$expected" <<< "$output"; then
    echo "Expected output to contain: $expected" >&2
    echo "$output" >&2
    exit 1
  fi
}

repo="$(mktemp -d)"
git_init "$repo"
commit_file "$repo" "feat(app): first release" "feature.txt"
output="$(run_plan "$repo")"
assert_output_contains "$output" "bump=minor"
assert_output_contains "$output" "next_stable_tag=v0.1.0"
assert_output_contains "$output" "release_tag=v0.1.0-dev.1"

git -C "$repo" tag v0.1.0
commit_file "$repo" "fix(app): patch issue" "fix.txt"
git -C "$repo" tag v0.1.1-dev.1
output="$(run_plan "$repo")"
assert_output_contains "$output" "previous_stable_tag=v0.1.0"
assert_output_contains "$output" "bump=patch"
assert_output_contains "$output" "next_stable_tag=v0.1.1"
assert_output_contains "$output" "release_tag=v0.1.1-dev.2"

commit_file "$repo" "feat!: breaking shape" "breaking.txt"
output="$(run_plan "$repo")"
assert_output_contains "$output" "bump=major"
assert_output_contains "$output" "next_stable_tag=v1.0.0"
assert_output_contains "$output" "release_tag=v1.0.0-dev.1"

repo_no_release="$(mktemp -d)"
git_init "$repo_no_release"
commit_file "$repo_no_release" "docs: update readme" "readme.md"
if (cd "$repo_no_release" && GITHUB_OUTPUT="$(mktemp)" bash "$SCRIPT_DIR/resolve-dev-release-plan.sh") >/tmp/resolve-dev-release-plan.out 2>/tmp/resolve-dev-release-plan.err; then
  echo "Expected non-releasable commits to fail" >&2
  exit 1
fi
