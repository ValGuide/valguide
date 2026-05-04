#!/usr/bin/env bash
set -euo pipefail

manifest="${DEPLOY_MANIFEST:?DEPLOY_MANIFEST is required}"
section=$(echo "$manifest" | jq -r '
  .targets[]
  | "- " + (if .result == "success" then "✅ " else "❌ " end) + .display + (if .url == "" then "" else " — " + .url end)
')

{
  echo "body<<EOF"
  echo "$section"
  echo "EOF"
} >> "$GITHUB_OUTPUT"
