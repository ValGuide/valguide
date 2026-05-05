#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/deploy-env.sh"

environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

load_deploy_env

for dir in workers/*/; do
  worker=$(basename "$dir")
  echo "::group::Deploying ${worker}"
  if [ "$environment" = "prod" ]; then
    pnpm --filter "@valguide/${worker}" run deploy
  else
    pnpm --filter "@valguide/${worker}" run deploy:dev
  fi
  echo "::endgroup::"
done
