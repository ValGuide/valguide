#!/usr/bin/env bash
set -euo pipefail

environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"

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
