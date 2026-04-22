#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/run-all-tests.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

echo "Test 1: Runner includes deploy script tests"
OUTPUT=$(bash "$SCRIPT")
assert_contains "includes deploy-targets test" "$OUTPUT" "RUN $REPO_ROOT/.github/scripts/deploy-targets.test.sh"
assert_contains "includes generate-changelog test" "$OUTPUT" "RUN $REPO_ROOT/.github/scripts/generate-changelog.test.sh"
assert_contains "prints passing results" "$OUTPUT" "Results:"
echo ""

print_results
