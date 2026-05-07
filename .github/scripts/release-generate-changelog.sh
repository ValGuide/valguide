#!/usr/bin/env bash
set -euo pipefail

previous_tag="${PREVIOUS_TAG:-}"
repository="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
server_url="${GITHUB_SERVER_URL:?GITHUB_SERVER_URL is required}"

if [ -z "$previous_tag" ]; then
  body="First release; no previous semver tag to diff against."
else
  body=$(
    git log --pretty=format:"%s ([%h](${server_url}/${repository}/commit/%H))" "${previous_tag}..HEAD" \
      | bash .github/scripts/generate-changelog.sh
  )
fi

{
  echo "body<<EOF"
  echo -e "$body"
  echo "EOF"
} >> "$GITHUB_OUTPUT"
