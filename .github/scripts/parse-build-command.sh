#!/usr/bin/env bash
set -euo pipefail

message="${COMMIT_MESSAGE:-}"
output_file="${GITHUB_OUTPUT:-/dev/stdout}"

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

normalize_spaces() {
  awk '{$1=$1; print}'
}

emit_skip() {
  {
    echo "should_build=false"
    echo "command="
    echo "environment="
    echo "release_kind="
    echo "dispatch_event_type="
    echo "scope="
  } >> "$output_file"
}

markers=()
while IFS= read -r found_marker; do
  [ -n "$found_marker" ] || continue
  markers+=("$found_marker")
done < <(printf '%s\n' "$message" | grep -Eio '\[(build|deploy|release)([[:space:]][^][]*)?\]' || true)

if [ "${#markers[@]}" -eq 0 ]; then
  emit_skip
  exit 0
fi

if [ "${#markers[@]}" -gt 1 ]; then
  echo "::error::Expected at most one [build ...], [deploy ...], or [release ...] marker, found ${#markers[@]}." >&2
  exit 1
fi

marker="${markers[0]}"
marker="${marker#[}"
marker="${marker%]}"
marker="$(printf '%s' "$marker" | tr '[:upper:]' '[:lower:]' | normalize_spaces)"

command="${marker%% *}"
scope="$marker"
if [ "$scope" = "$command" ]; then
  echo "::error::Build/release marker must include a deploy scope, for example [build all] or [release apps]." >&2
  exit 1
fi
scope="$(trim "${scope#"$command"}")"

case "$command" in
  build|deploy)
    environment="dev"
    release_kind="dev"
    dispatch_event_type="dev_build"
    ;;
  release)
    environment="prod"
    release_kind="stable"
    dispatch_event_type="prod_release"
    ;;
  *)
    echo "::error::Unsupported build command: ${command}" >&2
    exit 1
    ;;
esac

case "$scope" in
  all|apps)
    normalized_scope="$scope"
    ;;
  *)
    tokens="$(printf '%s' "$scope" | tr ',' ' ' | normalize_spaces)"
    normalized_scope=""
    for token in $tokens; do
      case "$token" in
        app|studio|admin|docs|links|storybook|www|workers)
          normalized_scope="${normalized_scope:+$normalized_scope }$token"
          ;;
        *)
          echo "::error::Unsupported build scope target: ${token}" >&2
          exit 1
          ;;
      esac
    done
    if [ -z "$normalized_scope" ]; then
      echo "::error::Build marker scope cannot be empty." >&2
      exit 1
    fi
    ;;
esac

{
  echo "should_build=true"
  echo "command=$command"
  echo "environment=$environment"
  echo "release_kind=$release_kind"
  echo "dispatch_event_type=$dispatch_event_type"
  echo "scope=$normalized_scope"
} >> "$output_file"
