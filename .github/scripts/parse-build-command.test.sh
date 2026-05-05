#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

run_parser() {
  local message="$1"
  local output
  output="$(mktemp)"
  COMMIT_MESSAGE="$message" GITHUB_OUTPUT="$output" bash "$SCRIPT_DIR/parse-build-command.sh"
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

output="$(run_parser $'fix(app): tighten auth\n\nSmall internal change.')"
assert_output_contains "$output" "should_build=false"
assert_output_contains "$output" "scope="

output="$(run_parser "feat(app): map polish [build all]")"
assert_output_contains "$output" "should_build=true"
assert_output_contains "$output" "command=build"
assert_output_contains "$output" "scope=all"

output="$(run_parser "fix: release selected apps [BUILD app, studio docs]")"
assert_output_contains "$output" "should_build=true"
assert_output_contains "$output" "scope=app studio docs"

output="$(run_parser $'feat: ship docs\n\n[deploy docs]')"
assert_output_contains "$output" "command=deploy"
assert_output_contains "$output" "scope=docs"

if COMMIT_MESSAGE="feat: bad [build search]" GITHUB_OUTPUT="$(mktemp)" bash "$SCRIPT_DIR/parse-build-command.sh" >/tmp/parse-build-command.out 2>/tmp/parse-build-command.err; then
  echo "Expected unsupported target to fail" >&2
  exit 1
fi

if COMMIT_MESSAGE="feat: double [build app] [deploy docs]" GITHUB_OUTPUT="$(mktemp)" bash "$SCRIPT_DIR/parse-build-command.sh" >/tmp/parse-build-command.out 2>/tmp/parse-build-command.err; then
  echo "Expected duplicate marker to fail" >&2
  exit 1
fi
