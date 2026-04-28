#!/bin/sh
set -eu

# Start or refresh Caddy in daemon mode without streaming its local proxy logs
# into the app dev console.
log_file="${TMPDIR:-/tmp}/valguide-caddy-start.log"

if pgrep -f "caddy.*Caddyfile.local" > /dev/null 2>&1; then
  caddy reload --config Caddyfile.local > "$log_file" 2>&1 || true
  exit 0
fi

if ! caddy start --config Caddyfile.local > "$log_file" 2>&1; then
  cat "$log_file" >&2
  exit 1
fi
