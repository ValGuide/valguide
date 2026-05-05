#!/usr/bin/env bash
set -euo pipefail

previous_tag="${PREVIOUS_TAG:-}"
repository="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
server_url="${GITHUB_SERVER_URL:?GITHUB_SERVER_URL is required}"

if [ -z "$previous_tag" ]; then
  echo "body=First release; no previous semver tag to diff against." >> "$GITHUB_OUTPUT"
  exit 0
fi

range="${previous_tag}..HEAD"
body=$(
  git log --pretty=format:"%s ([%h](${server_url}/${repository}/commit/%H))" "$range" \
    | bash .github/scripts/generate-changelog.sh
)

{
  echo "body<<EOF"
  echo -e "$body"
  echo "EOF"
} >> "$GITHUB_OUTPUT"
