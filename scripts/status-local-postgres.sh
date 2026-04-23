#!/bin/sh
set -eu

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed or not on PATH."
  exit 1
fi

if ! command -v pg_isready >/dev/null 2>&1; then
  echo "pg_isready is not installed or not on PATH."
  exit 1
fi

DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/valguide_local}"

echo "Checking local PostgreSQL..."
echo "Connection: $DATABASE_URL"

if ! pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; then
  echo "Status: unavailable"
  exit 1
fi

RESULT="$(psql "$DATABASE_URL" -Atqc "select current_database() || '|' || current_user || '|' || version();")"
DB_NAME="$(printf '%s' "$RESULT" | cut -d '|' -f 1)"
DB_USER="$(printf '%s' "$RESULT" | cut -d '|' -f 2)"
DB_VERSION="$(printf '%s' "$RESULT" | cut -d '|' -f 3-)"

echo "Status: available"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Version: $DB_VERSION"
