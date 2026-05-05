#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/deploy-targets.sh"
source "$SCRIPT_DIR/deploy-env.sh"

configure_app_deploy_env() {
  local app="${1:?app is required}"
  local environment="${2:?environment is required}"

  case "$app" in
    app|studio|admin|links|www)
      export VITE_POSTHOG_ENABLED=true

      posthog_key="${POSTHOG_PROJECT_KEY:-}"

      if [ -z "$posthog_key" ]; then
        echo "Missing PostHog key for ${app}-${environment}. Set POSTHOG_PROJECT_KEY as a GitHub Environment variable." >&2
        exit 1
      fi

      export VITE_POSTHOG_KEY="$posthog_key"
      export VITE_POSTHOG_HOST="${VITE_POSTHOG_HOST:?VITE_POSTHOG_HOST is required}"
      export VITE_APP_DOMAIN="${VITE_APP_DOMAIN:?VITE_APP_DOMAIN is required}"
      export VITE_PRIVACY_POLICY_URL="${VITE_PRIVACY_POLICY_URL:?VITE_PRIVACY_POLICY_URL is required}"
      export VITE_TERMS_OF_SERVICE_URL="${VITE_TERMS_OF_SERVICE_URL:?VITE_TERMS_OF_SERVICE_URL is required}"
      ;;
  esac

  case "$app" in
    app|studio|admin)
      export VITE_STUDIO_URL="${VITE_STUDIO_URL:?VITE_STUDIO_URL is required}"
      export VITE_R2_PUBLIC_URL="${VITE_R2_PUBLIC_URL:?VITE_R2_PUBLIC_URL is required}"
      ;;
  esac

  case "$app" in
    app|studio|admin|docs|links|www)
      export VITE_ENV="${environment}"
      ;;
  esac
}

main() {
  local app="${APP_NAME:?APP_NAME is required}"
  local environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

  load_deploy_env

  local url
  url=$(deploy_url_for "${app}-${environment}")
  echo "url=${url}" >> "$GITHUB_OUTPUT"

  configure_app_deploy_env "$app" "$environment"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main
fi
