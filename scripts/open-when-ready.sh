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

wait_and_open() {
  url="$1"
  attempt=1

  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    if is_ready "$url"; then
      open "$url"
      return 0
    fi

    sleep "$SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done

  open "$url"
}

for url in "$@"; do
  wait_and_open "$url" &
done

wait
