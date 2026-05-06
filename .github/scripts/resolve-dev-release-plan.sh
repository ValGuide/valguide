#!/usr/bin/env bash
set -euo pipefail

output_file="${GITHUB_OUTPUT:-/dev/stdout}"
release_kind="${RELEASE_KIND:-dev}"

case "$release_kind" in
  dev|stable)
    ;;
  *)
    echo "::error::Unsupported release kind: ${release_kind}." >&2
    exit 1
    ;;
esac

latest_stable_tag="$(
  git tag -l 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname \
    | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' \
    | head -n 1 || true
)"

if [ -n "$latest_stable_tag" ]; then
  range="${latest_stable_tag}..HEAD"
else
  range="HEAD"
fi

commits="$(git rev-list --reverse "$range")"
if [ -z "$commits" ]; then
  echo "::error::No commits found for release range ${range}." >&2
  exit 1
fi

bump="none"

while IFS= read -r sha; do
  [ -n "$sha" ] || continue
  subject="$(git log -1 --format=%s "$sha")"
  body="$(git log -1 --format=%B "$sha")"

  if printf '%s\n' "$subject" | grep -Eq '^[a-z]+(\([^)]+\))?!:' || printf '%s\n' "$body" | grep -Eq '^BREAKING CHANGE:'; then
    bump="major"
  elif [ "$bump" != "major" ] && printf '%s\n' "$subject" | grep -Eq '^feat(\([^)]+\))?:'; then
    bump="minor"
  elif [ "$bump" = "none" ] && printf '%s\n' "$subject" | grep -Eq '^(fix|perf)(\([^)]+\))?:'; then
    bump="patch"
  fi
done <<< "$commits"

if [ "$bump" = "none" ]; then
  echo "::error::Build marker was present, but no releasable conventional commits were found in ${range}." >&2
  echo "::error::Use feat:, fix:, perf:, or a breaking-change marker when a commit should create a release." >&2
  exit 1
fi

if [ -n "$latest_stable_tag" ]; then
  version="${latest_stable_tag#v}"
  IFS=. read -r major minor patch <<< "$version"
else
  major=0
  minor=0
  patch=0
fi

case "$bump" in
  major)
    if [ -z "$latest_stable_tag" ]; then
      major=1
      minor=0
      patch=0
    else
      major=$((major + 1))
      minor=0
      patch=0
    fi
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
esac

next_stable_tag="v${major}.${minor}.${patch}"
if [ "$release_kind" = "dev" ]; then
  latest_dev_number="$(
    git tag -l "${next_stable_tag}-dev.*" \
      | sed -nE "s/^${next_stable_tag//./\\.}-dev\\.([0-9]+)$/\\1/p" \
      | sort -n \
      | tail -n 1
  )"
  next_dev_number=$(( ${latest_dev_number:-0} + 1 ))
  release_tag="${next_stable_tag}-dev.${next_dev_number}"
else
  release_tag="$next_stable_tag"
  if git rev-parse "$release_tag" >/dev/null 2>&1; then
    echo "::error::Stable release tag already exists: ${release_tag}" >&2
    exit 1
  fi
fi

{
  echo "previous_stable_tag=$latest_stable_tag"
  echo "range=$range"
  echo "bump=$bump"
  echo "release_kind=$release_kind"
  echo "next_stable_tag=$next_stable_tag"
  echo "release_tag=$release_tag"
} >> "$output_file"
