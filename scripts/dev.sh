#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# dev.sh – Start one or more ValGuide apps in dev mode
#
# Usage:
#   pnpm dev:select <app> [<app> ...]
#   pnpm dev:select --no-remote <app> [<app> ...]
#   pnpm dev:select --all
#   pnpm dev:select --list
#
# Examples:
#   pnpm dev:select studio                 # just studio, remote bindings by default
#   pnpm dev:select studio admin           # studio + admin, remote bindings by default
#   pnpm dev:select api studio             # api + studio, remote bindings by default
#   pnpm dev:select --no-remote studio     # studio with local bindings
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
    api)       echo "" ;; # no browser needed
    *)         echo "" ;;
  esac
}

ALL_APPS="admin api app docs links storybook studio www"
USE_REMOTE=1
OPEN_BROWSER=1

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
  elif [ "$arg" = "--no-open" ] || [ "$arg" = "-n" ]; then
    OPEN_BROWSER=0
  else
    remaining="$remaining $arg"
  fi
done
# shellcheck disable=SC2086
set -- $remaining

# ── Handle flags ──────────────────────────────────────────────────────────
if [ $# -eq 0 ]; then
  echo "Usage: pnpm dev:select [--no-remote] [--no-open|-n] <app> [<app> ...]"
  echo ""
  echo "Available apps: $ALL_APPS"
  echo "Flags: --all (start all), --no-remote (use local bindings), --no-open/-n (skip browser open), --list (show apps)"
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

# ── Build turbo filter flags ─────────────────────────────────────────────
filters=""
urls=""
needs_caddy=0

for app in "$@"; do
  filters="$filters --filter ./apps/$app"
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
  echo "Starting (remote bindings): $*"
  export WRANGLER_REMOTE=true
else
  echo "Starting (local bindings): $*"
fi
# shellcheck disable=SC2086
exec pnpm env:load turbo run dev $filters
