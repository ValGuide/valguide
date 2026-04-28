#!/bin/sh
set -e

url_for() {
  case "$1" in
    admin) echo "https://admin-local.dev" ;;
    app) echo "https://app.local.dev" ;;
    studio) echo "https://studio.local.dev" ;;
    links) echo "https://links.local.dev" ;;
    www) echo "https://www.local.dev" ;;
    docs) echo "https://docs.local.dev" ;;
    *) echo "" ;;
  esac
}

health_url_for() {
  case "$1" in
    admin) echo "http://localhost:3001" ;;
    app) echo "http://localhost:3000" ;;
    studio) echo "http://localhost:3002" ;;
    links) echo "http://localhost:3003" ;;
    www) echo "http://localhost:3004" ;;
    docs) echo "http://localhost:3006" ;;
    *) echo "" ;;
  esac
}

DB_ENV="dev"
remaining=""

for arg in "$@"; do
  if [ "${arg#--db:}" != "$arg" ]; then
    DB_ENV=${arg#--db:}
  else
    remaining="$remaining $arg"
  fi
done

# shellcheck disable=SC2086
set -- $remaining

case "$DB_ENV" in
  local|dev|prod) ;;
  *)
    echo "Error: unsupported database environment '$DB_ENV'"
    echo "Supported database environments: local, dev, prod"
    exit 1
    ;;
esac

if [ $# -ne 1 ]; then
  echo "Usage: sh scripts/preview.sh [--db:local|dev|prod] <app>"
  exit 1
fi

TARGET=$1
URL=$(url_for "$TARGET")
HEALTH_URL=$(health_url_for "$TARGET")

if [ -z "$URL" ]; then
  echo "Error: preview launcher does not support target '$TARGET'"
  exit 1
fi

pnpm exec nx run @valguide/local-proxy:preview
if [ -n "$HEALTH_URL" ]; then
  (sh scripts/open-when-ready.sh "$URL=$HEALTH_URL") &
else
  (sh scripts/open-when-ready.sh "$URL") &
fi

echo "Starting preview (DB: $DB_ENV): $TARGET"
export VALGUIDE_DB_ENV="$DB_ENV"
exec pnpm exec nx run "@valguide/$TARGET:preview"
