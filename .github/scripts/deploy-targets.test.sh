#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"
source "$SCRIPT_DIR/deploy-targets.sh"

echo "Test 1: Known prod URL"
OUTPUT=$(deploy_url_for "app-prod")
assert_equals "app prod url" "$OUTPUT" "https://app.valguide.com"
echo ""

echo "Test 2: Known dev URL"
OUTPUT=$(deploy_url_for "studio-dev")
assert_equals "studio dev url" "$OUTPUT" "https://studio.valguide.dev"
echo ""

echo "Test 3: Storybook URLs"
assert_equals "storybook prod url" "$(deploy_url_for "storybook-prod")" "https://storybook.valguide.com"
assert_equals "storybook dev url" "$(deploy_url_for "storybook-dev")" "https://storybook.valguide.dev"
echo ""

echo "Test 4: Unknown URL returns empty"
OUTPUT=$(deploy_url_for "workers-prod")
assert_equals "workers has no url" "$OUTPUT" ""
echo ""

echo "Test 5: Display labels"
assert_equals "app display" "$(deploy_display_for "app")" "App"
assert_equals "workers display" "$(deploy_display_for "workers")" "Workers"
assert_equals "unknown display passthrough" "$(deploy_display_for "custom")" "custom"
echo ""

print_results
