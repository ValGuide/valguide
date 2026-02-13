#!/bin/sh
# Start Caddy in daemon mode if not already running with Caddyfile.local
if ! pgrep -f "caddy.*Caddyfile.local" > /dev/null 2>&1; then
  caddy start --config Caddyfile.local
fi
