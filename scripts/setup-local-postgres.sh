#!/bin/sh
set -eu

LOCAL_DB_NAME="valguide_local"
LEGACY_LOCAL_DB_NAME="valguide_prod"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This script currently supports macOS only."
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required to set up local PostgreSQL on macOS."
  echo "Install Homebrew first: https://brew.sh"
  exit 1
fi

find_postgres_formula() {
  for formula in postgresql@17 postgresql@16 postgresql@15 postgresql@14 postgresql; do
    if brew list --versions "$formula" >/dev/null 2>&1; then
      echo "$formula"
      return 0
    fi
  done

  echo "postgresql@17"
}

POSTGRES_FORMULA="$(find_postgres_formula)"

if ! brew list --versions "$POSTGRES_FORMULA" >/dev/null 2>&1; then
  echo "Installing $POSTGRES_FORMULA via Homebrew..."
  brew install "$POSTGRES_FORMULA"
fi

BREW_PREFIX="$(brew --prefix "$POSTGRES_FORMULA")"
POSTGRES_BIN="$BREW_PREFIX/bin"
export PATH="$POSTGRES_BIN:$PATH"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not available after installing $POSTGRES_FORMULA."
  exit 1
fi

echo "Starting $POSTGRES_FORMULA via brew services..."
brew services start "$POSTGRES_FORMULA"

wait_for_postgres() {
  attempts=0
  until pg_isready -h localhost -p 5432 >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 30 ]; then
      echo "PostgreSQL did not become ready on localhost:5432."
      exit 1
    fi
    sleep 1
  done
}

wait_for_postgres

run_psql() {
  psql -v ON_ERROR_STOP=1 postgres "$@"
}

database_exists() {
  psql -lqt postgres | cut -d '|' -f 1 | tr -d ' ' | grep -qx "$1"
}

echo "Ensuring postgres role and $LOCAL_DB_NAME database exist..."

run_psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
  ELSE
    ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
  END IF;
END
$$;
SQL

if ! database_exists "$LOCAL_DB_NAME" && database_exists "$LEGACY_LOCAL_DB_NAME"; then
  echo "Renaming legacy local database $LEGACY_LOCAL_DB_NAME -> $LOCAL_DB_NAME..."
  run_psql <<SQL
ALTER DATABASE $LEGACY_LOCAL_DB_NAME RENAME TO $LOCAL_DB_NAME;
SQL
fi

if ! database_exists "$LOCAL_DB_NAME"; then
  createdb -O postgres "$LOCAL_DB_NAME"
fi

run_psql <<SQL
ALTER DATABASE $LOCAL_DB_NAME OWNER TO postgres;
GRANT ALL PRIVILEGES ON DATABASE $LOCAL_DB_NAME TO postgres;
SQL

echo "Running local migrations..."
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/$LOCAL_DB_NAME}"
pnpm --dir packages/core exec drizzle-kit migrate

echo
echo "Local PostgreSQL is ready."
echo "Connection: postgresql://postgres:postgres@localhost:5432/$LOCAL_DB_NAME"
