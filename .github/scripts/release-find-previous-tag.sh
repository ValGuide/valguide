#!/usr/bin/env bash
set -euo pipefail

release_tag="${RELEASE_TAG:-}"

previous_tag=$(
  git tag -l 'v[0-9]*' --sort=-v:refname \
    | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' \
    | { if [ -n "$release_tag" ]; then grep -vxF "$release_tag"; else cat; fi; } \
    | head -1 \
    || true
)

if [ -n "$previous_tag" ]; then
  echo "Found previous tag: $previous_tag"
  echo "tag=$previous_tag" >> "$GITHUB_OUTPUT"
else
  echo "No previous semver tag found"
  echo "tag=" >> "$GITHUB_OUTPUT"
fi
