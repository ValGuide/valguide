#!/usr/bin/env bash
set -euo pipefail

target_sha="${TARGET_SHA:?TARGET_SHA is required}"
workflow="${REQUIRED_WORKFLOW:-CI}"
repository="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"

runs_json=$(gh run list \
  --repo "$repository" \
  --workflow "$workflow" \
  --commit "$target_sha" \
  --status success \
  --json conclusion,databaseId,headSha,name,url \
  --limit 20)

matching_count=$(
  jq --arg sha "$target_sha" '[.[] | select(.headSha == $sha and .conclusion == "success")] | length' <<< "$runs_json"
)

if [ "$matching_count" -eq 0 ]; then
  echo "::error::Required workflow '$workflow' has no successful run for $target_sha."
  exit 1
fi

run_url=$(jq -r --arg sha "$target_sha" '[.[] | select(.headSha == $sha and .conclusion == "success")][0].url' <<< "$runs_json")
echo "Verified required workflow '$workflow' for $target_sha: $run_url"
