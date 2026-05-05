#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/deploy-env.sh"
source "$SCRIPT_DIR/configure-app-deploy.sh"

app="${APP_NAME:?APP_NAME is required}"
environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

load_deploy_env
configure_app_deploy_env "$app" "$environment"

if [ "$environment" = "prod" ]; then
  pnpm --filter "@valguide/${app}" run deploy
else
  pnpm --filter "@valguide/${app}" run deploy:dev
fi
