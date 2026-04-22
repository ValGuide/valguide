#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$REPO_ROOT/.github/scripts/notify-deploy.sh"
source "$REPO_ROOT/.github/scripts/test-helpers.sh"

run_notify() {
  local tmp_dir stub_dir curl_body curl_args status
  tmp_dir=$(make_temp_dir)
  stub_dir="$tmp_dir/bin"
  mkdir -p "$stub_dir"
  curl_body="$tmp_dir/curl-body"
  curl_args="$tmp_dir/curl-args"

  cat >"$stub_dir/curl" <<EOF
#!/usr/bin/env bash
cat > "$curl_body"
printf '%s\n' "\$*" > "$curl_args"
EOF
  chmod +x "$stub_dir/curl"

  status=0
  if ! (
    cd "$REPO_ROOT"
    PATH="$stub_dir:$PATH" "$@" bash "$SCRIPT"
  ) >/dev/null 2>&1; then
    status=$?
  fi

  echo "__STATUS__=$status"
  echo "__CURL_BODY__=$curl_body"
  echo "__CURL_ARGS__=$curl_args"
}

extract_field() {
  echo "$1" | awk -F= -v key="$2" '$1==key {print $2}'
}

echo "Test 1: Prod success notification targets prod channel"
RESULT=$(run_notify env DEPLOY_ENVIRONMENT=prod GITHUB_SHA=abcdef123456 ACTOR=val RUN_URL=https://example.com/run RELEASE_URL=https://example.com/release CHANGELOG='### ✨ Features
- feat: deploy button ([abc](https://x))' DEPLOY_APP=true RESULT_APP=success SLACK_TOKEN=test-token)
STATUS=$(extract_field "$RESULT" "__STATUS__")
BODYFILE=$(extract_field "$RESULT" "__CURL_BODY__")
BODY=$(cat "$BODYFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "prod channel" "$BODY" '"channel": "deployments"'
assert_contains "success header" "$BODY" 'Deploy Complete'
assert_contains "release link" "$BODY" 'https://example.com/release'
assert_contains "app url" "$BODY" 'app.valguide.com'
echo ""

echo "Test 2: Dev failure notification targets dev channel and lists failures"
RESULT=$(run_notify env DEPLOY_ENVIRONMENT=dev GITHUB_SHA=abcdef123456 ACTOR=val RUN_URL=https://example.com/run DEPLOY_STUDIO=true RESULT_STUDIO=failure SLACK_TOKEN=test-token)
STATUS=$(extract_field "$RESULT" "__STATUS__")
BODYFILE=$(extract_field "$RESULT" "__CURL_BODY__")
BODY=$(cat "$BODYFILE")
assert_exit_code "success" "$STATUS" "0"
assert_contains "dev channel" "$BODY" '"channel": "deployments-dev"'
assert_contains "failure header" "$BODY" 'Deploy Finished'
assert_contains "failed app name" "$BODY" 'studio'
assert_contains "failure footer" "$BODY" 'Failed: studio'
echo ""

print_results
