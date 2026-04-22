#!/usr/bin/env bash
set -euo pipefail

environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"
timestamp="${DEPLOY_TIMESTAMP:?DEPLOY_TIMESTAMP is required}"
sha="${GITHUB_SHA:?GITHUB_SHA is required}"

short_sha=$(echo "$sha" | cut -c1-7)
tag="deploy-${environment}-${timestamp}-${short_sha}"

echo "tag=$tag" >> "$GITHUB_OUTPUT"
git tag "$tag"
git push origin "$tag"
