#!/usr/bin/env bash
set -euo pipefail

release_tag="${RELEASE_TAG:?RELEASE_TAG is required}"
next_stable_tag="${NEXT_STABLE_TAG:?NEXT_STABLE_TAG is required}"
previous_stable_tag="${PREVIOUS_STABLE_TAG:-}"
target_sha="${TARGET_SHA:?TARGET_SHA is required}"
build_scope="${BUILD_SCOPE:?BUILD_SCOPE is required}"
changelog_body="${CHANGELOG_BODY:-}"
repository="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
server_url="${GITHUB_SERVER_URL:?GITHUB_SERVER_URL is required}"

{
  printf '## Dev prerelease %s\n\n' "$release_tag"
  printf -- '- **Target SHA:** [`%s`](%s/%s/commit/%s)\n' "$target_sha" "$server_url" "$repository" "$target_sha"
  printf -- '- **Build scope:** `%s`\n' "$build_scope"
  printf -- '- **Planned stable version:** `%s`\n' "$next_stable_tag"
  if [ -n "$previous_stable_tag" ]; then
    printf -- '- **Previous stable release:** [`%s`](%s/%s/releases/tag/%s)\n' "$previous_stable_tag" "$server_url" "$repository" "$previous_stable_tag"
    printf -- '- **Full diff:** [%s...%s](%s/%s/compare/%s...%s)\n' "$previous_stable_tag" "$release_tag" "$server_url" "$repository" "$previous_stable_tag" "$release_tag"
  else
    printf -- '- **Previous stable release:** none\n'
  fi
  printf '\n## Changes\n\n'
  if [ -n "$changelog_body" ]; then
    printf '%s\n' "$changelog_body"
  else
    printf 'No commit changes found for this prerelease.\n'
  fi
} > release-notes.md
