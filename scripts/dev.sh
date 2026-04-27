#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# dev.sh – Start one or more ValGuide apps in dev mode
#
# Usage:
#   pnpm dev:select <app> [<app> ...]
#   pnpm dev:select --no-remote <app> [<app> ...]
#   pnpm dev:select --offline <app> [<app> ...]
#   pnpm dev:select --all
#   pnpm dev:select --list
#
# Examples:
#   pnpm dev:select studio                 # just studio, remote bindings by default
#   pnpm dev:select studio admin           # studio + admin, remote bindings by default
#   pnpm dev:select --db:prod studio       # studio against prod DB
#   pnpm dev:select --no-remote studio     # studio with local bindings
#   pnpm dev:select --offline studio       # studio fully offline (local DB + local bindings)
#   pnpm dev:select --no-open studio       # studio without opening browser tabs
#   pnpm dev:select --no-remote admin app  # admin + app with local bindings
#   pnpm dev:select --all                  # everything (same as `pnpm dev`)
#   pnpm dev:select --list              # show available apps
# ---------------------------------------------------------------------------

# Map app name → local HTTPS URL (empty = no browser open / no caddy needed)
url_for() {
  case "$1" in
    admin)     echo "https://admin-local.dev" ;;
    app)       echo "https://app.local.dev" ;;
    studio)    echo "https://studio.local.dev" ;;
    storybook) echo "https://storybook.local.dev" ;;
    links)     echo "https://links.local.dev" ;;
    www)       echo "https://www.local.dev" ;;
    docs)      echo "https://docs.local.dev" ;;
    *)         echo "" ;;
  esac
}

ALL_APPS="admin app docs links storybook studio www"
USE_REMOTE=1
OPEN_BROWSER=1
DB_ENV="dev"

# ── Expand comma-separated args (e.g. "studio,admin" → "studio admin") ────
expanded=""
for arg in "$@"; do
  expanded="$expanded $(echo "$arg" | tr ',' ' ')"
done
# shellcheck disable=SC2086
set -- $expanded

# ── Extract flags ─────────────────────────────────────────────────────────
remaining=""
for arg in "$@"; do
  if [ "$arg" = "--remote" ]; then
    USE_REMOTE=1
  elif [ "$arg" = "--no-remote" ]; then
    USE_REMOTE=0
  elif [ "$arg" = "--offline" ]; then
    USE_REMOTE=0
    DB_ENV="local"
  elif [ "$arg" = "--no-open" ] || [ "$arg" = "-n" ]; then
    OPEN_BROWSER=0
  elif [ "${arg#--db:}" != "$arg" ]; then
    DB_ENV=${arg#--db:}
  else
    remaining="$remaining $arg"
  fi
done
# shellcheck disable=SC2086
set -- $remaining

# ── Handle flags ──────────────────────────────────────────────────────────
if [ $# -eq 0 ]; then
  echo "Usage: pnpm dev:select [--no-remote] [--offline] [--no-open|-n] <app> [<app> ...]"
  echo ""
  echo "Available apps: $ALL_APPS"
  echo "Flags: --all (start all), --no-remote (use local bindings), --offline (use local DB and local bindings), --no-open/-n (skip browser open), --list (show apps)"
  exit 1
fi

if [ "$1" = "--list" ]; then
  echo "Available apps:"
  for a in $ALL_APPS; do
    url=$(url_for "$a")
    if [ -n "$url" ]; then
      printf "  %-12s %s\n" "$a" "$url"
    else
      printf "  %-12s (no browser URL)\n" "$a"
    fi
  done
  exit 0
fi

if [ "$1" = "--all" ]; then
  set -- $ALL_APPS
fi

case "$DB_ENV" in
  local|dev|prod) ;;
  *)
    echo "Error: unsupported database environment '$DB_ENV'"
    echo "Supported database environments: local, dev, prod"
    exit 1
    ;;
esac

# ── Validate app names ───────────────────────────────────────────────────
for app in "$@"; do
  valid=0
  for a in $ALL_APPS; do
    if [ "$app" = "$a" ]; then valid=1; break; fi
  done
  if [ "$valid" -eq 0 ]; then
    echo "Error: unknown app '$app'"
    echo "Available apps: $ALL_APPS"
    exit 1
  fi
done

# ── Build Nx project selectors ───────────────────────────────────────────
projects=""
target="dev"
urls=""
needs_caddy=0

for app in "$@"; do
  project_name="@valguide/$app"
  if [ -n "$projects" ]; then
    projects="$projects,$project_name"
  else
    projects="$project_name"
  fi

  url=$(url_for "$app")
  if [ -n "$url" ]; then
    urls="$urls $url"
    needs_caddy=1
  fi
done

# ── Ensure Caddy is running (if any app needs HTTPS) ─────────────────────
if [ "$needs_caddy" -eq 1 ]; then
  sh scripts/ensure-caddy.sh
fi

# ── Open browser tabs once the apps are reachable ─────────────────────────
if [ "$OPEN_BROWSER" -eq 1 ] && [ -n "$urls" ]; then
  (
    # shellcheck disable=SC2086
    sh scripts/open-when-ready.sh $urls
  ) &
fi

# ── Start dev servers ────────────────────────────────────────────────────
if [ "$USE_REMOTE" -eq 1 ]; then
  echo "Starting (remote bindings, DB: $DB_ENV): $*"
  export WRANGLER_REMOTE=true
  target="dev:remote"
else
  echo "Starting (local bindings, DB: $DB_ENV): $*"
fi

export VALGUIDE_DB_ENV="$DB_ENV"

exec pnpm exec nx run-many -t "$target" --projects="$projects"
