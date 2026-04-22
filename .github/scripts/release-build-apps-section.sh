#!/usr/bin/env bash
set -euo pipefail

source .github/scripts/deploy-targets.sh

environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"
section=""

add_app() {
  local should="$1"
  local result="$2"
  local name="$3"

  if [ "$should" != "true" ]; then
    return
  fi

  local url=""
  local display=""
  local suffix=""

  url=$(deploy_url_for "${name}-${environment}")
  display=$(deploy_display_for "$name")

  if [ -n "$url" ]; then
    suffix=" — ${url}"
  fi

  if [ "$result" = "success" ]; then
    section="${section}- ✅ ${display}${suffix}\n"
  else
    section="${section}- ❌ ${display}${suffix}\n"
  fi
}

add_app "${DEPLOY_APP:-false}" "${RESULT_APP:-skipped}" "app"
add_app "${DEPLOY_STUDIO:-false}" "${RESULT_STUDIO:-skipped}" "studio"
add_app "${DEPLOY_ADMIN:-false}" "${RESULT_ADMIN:-skipped}" "admin"
add_app "${DEPLOY_DOCS:-false}" "${RESULT_DOCS:-skipped}" "docs"
add_app "${DEPLOY_LINKS:-false}" "${RESULT_LINKS:-skipped}" "links"
add_app "${DEPLOY_STORYBOOK:-false}" "${RESULT_STORYBOOK:-skipped}" "storybook"
add_app "${DEPLOY_WWW:-false}" "${RESULT_WWW:-skipped}" "www"
add_app "${DEPLOY_WORKERS:-false}" "${RESULT_WORKERS:-skipped}" "workers"

{
  echo "body<<EOF"
  echo -e "$section"
  echo "EOF"
} >> "$GITHUB_OUTPUT"
