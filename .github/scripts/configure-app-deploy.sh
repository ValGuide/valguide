#!/usr/bin/env bash
set -euo pipefail

source .github/scripts/deploy-targets.sh

app="${APP_NAME:?APP_NAME is required}"
environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

url=$(deploy_url_for "${app}-${environment}")
echo "url=${url}" >> "$GITHUB_OUTPUT"

case "$app" in
  app|studio|admin|links|www)
    echo "VITE_POSTHOG_ENABLED=true" >> "$GITHUB_ENV"

    posthog_key="${POSTHOG_PROJECT_KEY:-}"

    if [ -z "$posthog_key" ]; then
      echo "Missing PostHog key for ${app}-${environment}. Set POSTHOG_PROJECT_KEY as a GitHub Environment variable." >&2
      exit 1
    fi

    echo "VITE_POSTHOG_KEY=${posthog_key}" >> "$GITHUB_ENV"
    echo "VITE_POSTHOG_HOST=${VITE_POSTHOG_HOST:?VITE_POSTHOG_HOST is required}" >> "$GITHUB_ENV"
    echo "VITE_APP_DOMAIN=${VITE_APP_DOMAIN:?VITE_APP_DOMAIN is required}" >> "$GITHUB_ENV"
    echo "VITE_PRIVACY_POLICY_URL=${VITE_PRIVACY_POLICY_URL:?VITE_PRIVACY_POLICY_URL is required}" >> "$GITHUB_ENV"
    echo "VITE_TERMS_OF_SERVICE_URL=${VITE_TERMS_OF_SERVICE_URL:?VITE_TERMS_OF_SERVICE_URL is required}" >> "$GITHUB_ENV"
    ;;
esac

case "$app" in
  app|studio|admin)
    echo "VITE_STUDIO_URL=${VITE_STUDIO_URL:?VITE_STUDIO_URL is required}" >> "$GITHUB_ENV"
    echo "VITE_R2_PUBLIC_URL=${VITE_R2_PUBLIC_URL:?VITE_R2_PUBLIC_URL is required}" >> "$GITHUB_ENV"
    ;;
esac

case "$app" in
  app|studio|admin|docs|links|www)
    echo "VITE_ENV=${environment}" >> "$GITHUB_ENV"
    ;;
esac
