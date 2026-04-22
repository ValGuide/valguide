#!/usr/bin/env bash
set -euo pipefail

APPS="app studio admin docs links storybook www workers"
ANY=false
APP_LIST=$(echo "$APPS" | tr ' ' '\n')

set_outputs_from_scopes() {
  local scopes="${1:-}"
  local any=false

  for app in $APPS; do
    if echo "$scopes" | grep -qx "$app"; then
      echo "deploy-${app}=true" >> "$GITHUB_OUTPUT"
      any=true
    else
      echo "deploy-${app}=false" >> "$GITHUB_OUTPUT"
    fi
  done

  ANY=$any
}

if [ -n "${MANUAL_ENVIRONMENT:-}" ]; then
  echo "environment=${MANUAL_ENVIRONMENT}" >> "$GITHUB_OUTPUT"

  raw_scope=$(printf '%s' "${MANUAL_SCOPE:-}" | tr '[:upper:]' '[:lower:]')
  normalized_scope=$(printf '%s' "$raw_scope" | sed -E 's/^\[build[[:space:]]+//; s/\][[:space:]]*$//')

  if [ -z "$normalized_scope" ]; then
    echo "::error::Manual deploy scope cannot be empty."
    exit 1
  fi

  if [ "$normalized_scope" = "all" ]; then
    echo "✅ Manual deploy requested for all apps"
    for app in $APPS; do
      echo "deploy-${app}=true" >> "$GITHUB_OUTPUT"
    done
    ANY=true
  elif [ "$normalized_scope" = "apps" ]; then
    echo "✅ Manual deploy requested for all apps except workers"
    for app in $APPS; do
      if [ "$app" = "workers" ]; then
        echo "deploy-${app}=false" >> "$GITHUB_OUTPUT"
      else
        echo "deploy-${app}=true" >> "$GITHUB_OUTPUT"
      fi
    done
    ANY=true
  else
    scopes=$(printf '%s' "$normalized_scope" | tr ' ,' '\n' | tr -s '\n' | sed '/^$/d')
    unknown=$(printf '%s\n' "$scopes" | while read -r scope; do
      if [ -n "$scope" ] && ! echo "$APP_LIST" | grep -qx "$scope"; then
        echo "$scope"
      fi
    done)

    if [ -n "$unknown" ]; then
      echo "::error::Unknown manual deploy scope(s): $(echo "$unknown" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"
      echo "::error::Allowed values: all, apps, or any of: $APPS"
      exit 1
    fi

    echo "✅ Manual deploy requested for: $(echo "$scopes" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"
    set_outputs_from_scopes "$scopes"
  fi
else
  if [ "${GITHUB_REF:-}" = "refs/heads/main" ]; then
    echo "environment=prod" >> "$GITHUB_OUTPUT"
  else
    echo "environment=dev" >> "$GITHUB_OUTPUT"
  fi

  if echo "${COMMIT_MSG:-}" | grep -qF '[build all]'; then
    echo "✅ [build all] found — deploying everything"
    for app in $APPS; do
      echo "deploy-${app}=true" >> "$GITHUB_OUTPUT"
    done
    ANY=true
  elif echo "${COMMIT_MSG:-}" | grep -qF '[build apps]'; then
    echo "✅ [build apps] found — deploying all apps except workers"
    for app in $APPS; do
      if [ "$app" = "workers" ]; then
        echo "deploy-${app}=false" >> "$GITHUB_OUTPUT"
      else
        echo "deploy-${app}=true" >> "$GITHUB_OUTPUT"
      fi
    done
    ANY=true
  else
    scopes=$(echo "${COMMIT_MSG:-}" | grep -oE '\[build [^]]+' | sed 's/\[build //' | tr ' ,' '\n' | tr -s '\n' || true)
    if [ -n "$scopes" ]; then
      echo "Found scoped build request: $(echo "$scopes" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"
    else
      echo "No [build] tag found — nothing to deploy"
    fi

    set_outputs_from_scopes "$scopes"
  fi
fi

echo "any-deploy=$ANY" >> "$GITHUB_OUTPUT"
