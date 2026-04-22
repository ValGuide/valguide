#!/usr/bin/env bash
set -euo pipefail

environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"
tag_prefix="deploy-${environment}-"
previous_tag=$(git tag -l "${tag_prefix}*" --sort=-creatordate | head -1)

if [ -n "$previous_tag" ]; then
  echo "Found previous tag: $previous_tag"
  echo "tag=$previous_tag" >> "$GITHUB_OUTPUT"
else
  echo "No previous tag found — this is the first consolidated release"
  echo "tag=" >> "$GITHUB_OUTPUT"
fi
