#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0

assert_contains() {
  local desc=$1
  local output=$2
  local expected=$3
  if echo "$output" | grep -qF -- "$expected"; then
    PASS=$((PASS + 1))
    echo "  ✅ $desc"
  else
    echo "  ❌ FAIL: $desc"
    echo "     Expected to contain: $expected"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local desc=$1
  local output=$2
  local unexpected=$3
  if echo "$output" | grep -qF -- "$unexpected"; then
    echo "  ❌ FAIL: $desc"
    echo "     Expected NOT to contain: $unexpected"
    FAIL=$((FAIL + 1))
  else
    PASS=$((PASS + 1))
    echo "  ✅ $desc"
  fi
}

assert_equals() {
  local desc=$1
  local actual=$2
  local expected=$3
  if [ "$actual" = "$expected" ]; then
    PASS=$((PASS + 1))
    echo "  ✅ $desc"
  else
    echo "  ❌ FAIL: $desc"
    echo "     Expected: $expected"
    echo "     Actual:   $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_file_contains() {
  local desc=$1
  local file=$2
  local expected=$3
  local content=""
  content=$(cat "$file")
  assert_contains "$desc" "$content" "$expected"
}

assert_exit_code() {
  local desc=$1
  local actual=$2
  local expected=$3
  assert_equals "$desc" "$actual" "$expected"
}

make_temp_dir() {
  mktemp -d "${TMPDIR:-/tmp}/github-script-tests.XXXXXX"
}

print_results() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Results: $PASS passed, $FAIL failed"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  [ "$FAIL" -eq 0 ]
}
