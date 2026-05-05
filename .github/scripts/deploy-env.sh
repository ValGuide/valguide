#!/usr/bin/env bash

load_deploy_env() {
  local env_file="${DEPLOY_ENV_FILE:-}"

  if [ -z "$env_file" ]; then
    echo "DEPLOY_ENV_FILE is required." >&2
    return 1
  fi

  if [ ! -f "$env_file" ]; then
    echo "Deploy env file not found: $env_file" >&2
    return 1
  fi

  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
}
