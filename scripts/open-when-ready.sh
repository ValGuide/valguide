#!/bin/sh
set -eu

MAX_ATTEMPTS="${OPEN_WHEN_READY_MAX_ATTEMPTS:-120}"
SLEEP_SECONDS="${OPEN_WHEN_READY_SLEEP_SECONDS:-0.5}"

is_ready() {
  url="$1"

  if command -v curl >/dev/null 2>&1; then
    http_code=$(curl -k -sS -L -o /dev/null -w "%{http_code}" --connect-timeout 1 --max-time 1 "$url" 2>/dev/null || true)

    case "$http_code" in
      000|502|503|504)
        return 1
        ;;
      *)
        [ -n "$http_code" ]
        ;;
    esac
  fi

  return 0
}

open_target() {
  url="$1"

  if command -v open >/dev/null 2>&1; then
    open -u "$url" 2>/dev/null || open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url"
  else
    printf 'Ready: %s\n' "$url"
  fi
}

wait_and_open() {
  open_url="$1"
  health_url="$1"
  attempt=1

  case "$open_url" in
    *=*)
      health_url=${open_url#*=}
      open_url=${open_url%%=*}
      ;;
  esac

  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    if is_ready "$health_url"; then
      open_target "$open_url"
      return 0
    fi

    sleep "$SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done

  open_target "$open_url"
}

for entry in "$@"; do
  wait_and_open "$entry" &
done

wait
