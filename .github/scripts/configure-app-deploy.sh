#!/usr/bin/env bash
set -euo pipefail

source .github/scripts/deploy-targets.sh

app="${APP_NAME:?APP_NAME is required}"
environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

url=$(deploy_url_for "${app}-${environment}")
echo "url=${url}" >> "$GITHUB_OUTPUT"

if [ "$environment" = "prod" ]; then
  domain_suffix="com"
else
  domain_suffix="dev"
fi

case "$app" in
  app|studio|admin|links|www)
    echo "VITE_POSTHOG_ENABLED=true" >> "$GITHUB_ENV"

    if [ "$environment" = "prod" ]; then
      posthog_key="${POSTHOG_PROJECT_KEY_PROD:-}"
    else
      posthog_key="${POSTHOG_PROJECT_KEY_DEV:-}"
    fi

    if [ -z "$posthog_key" ]; then
      environment_upper=$(printf '%s' "$environment" | tr '[:lower:]' '[:upper:]')
      echo "Missing PostHog key for ${app}-${environment}. Set POSTHOG_PROJECT_KEY_${environment_upper} as a GitHub Variable." >&2
      exit 1
    fi

    echo "VITE_POSTHOG_KEY=${posthog_key}" >> "$GITHUB_ENV"
    echo "VITE_POSTHOG_HOST=https://e.valguide.${domain_suffix}" >> "$GITHUB_ENV"
    echo "VITE_APP_DOMAIN=app.valguide.${domain_suffix}" >> "$GITHUB_ENV"
    echo "VITE_PRIVACY_POLICY_URL=https://www.valguide.${domain_suffix}/privacy-policy" >> "$GITHUB_ENV"
    echo "VITE_TERMS_OF_SERVICE_URL=https://www.valguide.${domain_suffix}/terms-of-service" >> "$GITHUB_ENV"
    ;;
esac

case "$app" in
  app|studio|admin)
    echo "VITE_STUDIO_URL=https://studio.valguide.${domain_suffix}" >> "$GITHUB_ENV"
    echo "VITE_R2_PUBLIC_URL=https://assets.valguide.${domain_suffix}" >> "$GITHUB_ENV"
    ;;
esac

case "$app" in
  app|studio|admin|docs|links|www)
    echo "VITE_ENV=${environment}" >> "$GITHUB_ENV"
    ;;
esac
