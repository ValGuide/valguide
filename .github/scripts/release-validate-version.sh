#!/usr/bin/env bash
set -euo pipefail

version="${RELEASE_VERSION:?RELEASE_VERSION is required}"

if [[ "$version" == v* ]]; then
  tag="$version"
else
  tag="v$version"
fi

if [[ ! "$tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "::error::Release version must be semver like v1.2.3 or v1.2.3-rc.1."
  exit 1
fi

echo "tag=$tag" >> "$GITHUB_OUTPUT"
echo "Release tag: $tag"
