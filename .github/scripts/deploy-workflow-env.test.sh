#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORKFLOW="$REPO_ROOT/.github/workflows/_deploy.yml"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

JOB_ENV=$(
  awk '
    /^jobs:$/ { in_jobs = 1 }
    in_jobs && /^  deploy:$/ { in_deploy = 1; next }
    in_deploy && /^    steps:$/ { exit }
    in_deploy && /^    env:$/ { print }
  ' "$WORKFLOW"
)

echo "Test 1: Deploy job has no job-level env block"
assert_equals "no job-level env" "$JOB_ENV" ""
echo ""

WORKFLOW_CONTENT=$(cat "$WORKFLOW")
echo "Test 2: Hosted deploy config is routed through action inputs"
assert_contains "write env action" "$WORKFLOW_CONTENT" "uses: ./.github/actions/write-deploy-env"
assert_contains "deploy env file path" "$WORKFLOW_CONTENT" "DEPLOY_ENV_FILE: \${{ steps.deploy-env.outputs.env-file }}"
assert_not_contains "no vars context in deploy workflow" "$WORKFLOW_CONTENT" "\${{ vars."
echo ""

print_results
