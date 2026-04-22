#!/usr/bin/env bash
set -euo pipefail

app="${APP_NAME:?APP_NAME is required}"
environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

if [ "$environment" = "prod" ]; then
  pnpm --filter "@valguide/${app}" run deploy
else
  pnpm --filter "@valguide/${app}" run deploy:dev
fi
