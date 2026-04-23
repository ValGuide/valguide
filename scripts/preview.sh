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

if [ -z "$URL" ]; then
  echo "Error: preview launcher does not support target '$TARGET'"
  exit 1
fi

sh scripts/ensure-caddy.sh
(sh scripts/open-when-ready.sh "$URL") &

echo "Starting preview (DB: $DB_ENV): $TARGET"
export VALGUIDE_DB_ENV="$DB_ENV"
exec nx run "@valguide/$TARGET:preview"
