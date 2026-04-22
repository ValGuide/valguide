#!/usr/bin/env bash
set -euo pipefail

source .github/scripts/deploy-targets.sh

sha7="${GITHUB_SHA:0:7}"
environment="${DEPLOY_ENVIRONMENT:?DEPLOY_ENVIRONMENT is required}"
environment_upper=$(echo "$environment" | tr '[:lower:]' '[:upper:]')

lines=""
fail_count=0
fail_names=""

add_line() {
  local should="$1"
  local result="$2"
  local display_name="$3"

  if [ "$should" != "true" ]; then
    return
  fi

  local url=""
  local suffix=""
  url=$(deploy_url_for "${display_name}-${environment}")

  if [ -n "$url" ]; then
    suffix="  <${url}|${url#https://}>"
  fi

  if [ "$result" = "success" ]; then
    lines="${lines}✅  \`${display_name}\`${suffix}\n"
  else
    lines="${lines}❌  \`${display_name}\`${suffix}\n"
    fail_names="${fail_names}${display_name}, "
    fail_count=$((fail_count + 1))
  fi
}

add_line "${DEPLOY_APP:-false}" "${RESULT_APP:-skipped}" "app"
add_line "${DEPLOY_STUDIO:-false}" "${RESULT_STUDIO:-skipped}" "studio"
add_line "${DEPLOY_ADMIN:-false}" "${RESULT_ADMIN:-skipped}" "admin"
add_line "${DEPLOY_DOCS:-false}" "${RESULT_DOCS:-skipped}" "docs"
add_line "${DEPLOY_LINKS:-false}" "${RESULT_LINKS:-skipped}" "links"
add_line "${DEPLOY_STORYBOOK:-false}" "${RESULT_STORYBOOK:-skipped}" "storybook"
add_line "${DEPLOY_WWW:-false}" "${RESULT_WWW:-skipped}" "www"
add_line "${DEPLOY_WORKERS:-false}" "${RESULT_WORKERS:-skipped}" "workers"

if [ "$fail_count" -gt 0 ]; then
  header="🚨 *Deploy Finished — ${environment_upper}* (${fail_count} failed)"
  plain_header="🚨 Deploy Finished — ${environment_upper} (${fail_count} failed)"
  fail_names="${fail_names%, }"
else
  header="🚀 *Deploy Complete — ${environment_upper}*"
  plain_header="🚀 Deploy Complete — ${environment_upper}"
fi

message=$(echo -e "${header}\n\`${sha7}\` by @${ACTOR}\n\n${lines}")

if [ "$fail_count" -gt 0 ]; then
  footer_text="_Failed: ${fail_names}_  •  <${RUN_URL}|View Run>"
else
  footer_text="<${RUN_URL}|View Run>"
fi

if [ -n "${RELEASE_URL:-}" ]; then
  footer_text="📋 <${RELEASE_URL}|Full Release Notes>  •  ${footer_text}"
fi

changelog_block=""
if [ -n "${CHANGELOG:-}" ]; then
  slack_changelog=$(echo -e "$CHANGELOG" \
    | sed -E 's/^### (.+)/*\1*/' \
    | sed 's/^- /• /' \
    | sed -E 's/^(• )[a-z]+(\([^)]*\))?!?: /\1/' \
    | sed -E 's/\[([^]]+)\]\(([^)]+)\)/<\2|\1>/g' \
    | sed '/^$/d' \
    | awk '/^\*[^*]/ && NR>1 {print ""} {print}')

  total_lines=$(echo "$slack_changelog" | wc -l | tr -d ' ')
  max_lines=14
  if [ "$total_lines" -gt "$max_lines" ]; then
    slack_changelog=$(echo "$slack_changelog" | head -n "$max_lines")
    remaining=$((total_lines - max_lines))
    if [ -n "${RELEASE_URL:-}" ]; then
      slack_changelog=$(printf "%s\n_…+%d more_ — <${RELEASE_URL}|see full changelog>" "$slack_changelog" "$remaining")
    fi
  fi

  changelog_block=$(printf "*Changelog*\n%s" "$slack_changelog")
fi

plain=$(echo -e "${plain_header}\nCommit: ${sha7} by @${ACTOR}")

if [ "$environment" = "prod" ]; then
  slack_channel="deployments"
else
  slack_channel="deployments-dev"
fi

jq -n \
  --arg channel "$slack_channel" \
  --arg text "$plain" \
  --arg body "$message" \
  --arg changelog "$changelog_block" \
  --arg footer "$footer_text" \
  '{
    channel: $channel,
    text: $text,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: $body } },
      (if ($changelog | length) > 0 then
        { type: "section", text: { type: "mrkdwn", text: $changelog } }
      else empty end),
      { type: "section", text: { type: "mrkdwn", text: $footer } },
      { type: "divider" }
    ]
  }' | curl -sf -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer ${SLACK_TOKEN:?SLACK_TOKEN is required}" \
    -H "Content-Type: application/json" \
    -d @-
