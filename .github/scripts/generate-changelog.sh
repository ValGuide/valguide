#!/usr/bin/env bash
# generate-changelog.sh
#
# Reads git commit subject lines from stdin (one per line).
# Each line has format: "subject ([short_hash](commit_url))"
# Outputs categorized markdown changelog grouped by conventional commit type.
#
# Usage:
#   git log --pretty=format:"%s ([%h](https://github.com/org/repo/commit/%H))" v1..v2 \
#     | bash scripts/generate-changelog.sh

set -euo pipefail

LINES=$(cat)

# Exit early if no input
if [ -z "$LINES" ]; then
  exit 0
fi

categorize() {
  local pattern=$1
  echo "$LINES" | grep -E "$pattern" | sed 's/^/- /' || true
}

BREAKING=$(categorize "^.+(\(.+\))?!:")
FEATURES=$(categorize "^feat(\(.+\))?[!]?:")
FIXES=$(categorize "^fix(\(.+\))?[!]?:")
PERF=$(categorize "^perf(\(.+\))?[!]?:")
REFACTOR=$(categorize "^refactor(\(.+\))?[!]?:")
DOCS=$(categorize "^docs(\(.+\))?[!]?:")
TESTS=$(categorize "^test(\(.+\))?[!]?:")
CHORES=$(categorize "^chore(\(.+\))?[!]?:")
BUILD=$(categorize "^build(\(.+\))?[!]?:")
CI=$(categorize "^ci(\(.+\))?[!]?:")
STYLE=$(categorize "^style(\(.+\))?[!]?:")
REVERT=$(categorize "^revert(\(.+\))?[!]?:")
PLAN=$(categorize "^plan(\(.+\))?[!]?:")

BODY=""
[ -n "$BREAKING" ] && BODY="${BODY}### 💥 Breaking Changes\n${BREAKING}\n\n"
[ -n "$FEATURES" ] && BODY="${BODY}### ✨ Features\n${FEATURES}\n\n"
[ -n "$FIXES" ]    && BODY="${BODY}### 🐛 Fixes\n${FIXES}\n\n"
[ -n "$PERF" ]     && BODY="${BODY}### ⚡ Performance\n${PERF}\n\n"
[ -n "$REFACTOR" ] && BODY="${BODY}### ♻️ Refactors\n${REFACTOR}\n\n"
[ -n "$DOCS" ]     && BODY="${BODY}### 📖 Docs\n${DOCS}\n\n"
[ -n "$TESTS" ]    && BODY="${BODY}### 🧪 Tests\n${TESTS}\n\n"
[ -n "$CHORES" ]   && BODY="${BODY}### 🔧 Chores\n${CHORES}\n\n"
[ -n "$BUILD" ]    && BODY="${BODY}### 🏗️ Build\n${BUILD}\n\n"
[ -n "$CI" ]       && BODY="${BODY}### 👷 CI\n${CI}\n\n"
[ -n "$STYLE" ]    && BODY="${BODY}### 🎨 Style\n${STYLE}\n\n"
[ -n "$REVERT" ]   && BODY="${BODY}### ⏪ Reverts\n${REVERT}\n\n"
[ -n "$PLAN" ]     && BODY="${BODY}### 📋 Plan\n${PLAN}\n\n"

# Collect commits that don't match any known conventional commit prefix
KNOWN="feat|fix|chore|docs|style|refactor|test|perf|ci|build|revert|plan"
OTHER_LINES=$(echo "$LINES" \
  | grep -Ev "^($KNOWN)(\(.+\))?[!]?:" \
  | grep -Ev "^\[build " \
  || true)

if [ -n "$OTHER_LINES" ]; then
  # Group by unknown prefixes (e.g., "wip:", "release:")
  UNKNOWN_PREFIXES=$(echo "$OTHER_LINES" | grep -oE "^[a-z]+" | sort -u || true)

  for prefix in $UNKNOWN_PREFIXES; do
    HEADING=$(echo "$prefix" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
    MATCHES=$(echo "$OTHER_LINES" | grep -E "^${prefix}(\(.+\))?[!]?:" | sed 's/^/- /' || true)
    [ -n "$MATCHES" ] && BODY="${BODY}### ${HEADING}\n${MATCHES}\n\n"
    OTHER_LINES=$(echo "$OTHER_LINES" | grep -Ev "^${prefix}(\(.+\))?[!]?:" || true)
  done

  if [ -n "$OTHER_LINES" ]; then
    UNCATEGORIZED=$(echo "$OTHER_LINES" | sed 's/^/- /')
    BODY="${BODY}### 📝 Other\n${UNCATEGORIZED}\n\n"
  fi
fi

echo -e "$BODY"
