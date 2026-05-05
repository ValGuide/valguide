#!/usr/bin/env bash
set -euo pipefail

tag="${RELEASE_TAG:?RELEASE_TAG is required}"

echo "tag=$tag" >> "$GITHUB_OUTPUT"
git tag -a "$tag" -m "Release $tag"
git push origin "$tag"
