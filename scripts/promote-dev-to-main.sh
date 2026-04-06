#!/usr/bin/env sh

set -eu

if [ -n "$(git status --porcelain)" ]; then
  echo "val: promote requires a clean git worktree." >&2
  echo "Commit, stash, or discard local changes before running this command." >&2
  exit 1
fi

current_branch="$(git branch --show-current)"

restore_branch() {
  branch="$1"
  if [ -n "$branch" ] && [ "$branch" != "$(git branch --show-current)" ]; then
    git switch "$branch" >/dev/null 2>&1 || true
  fi
}

trap 'restore_branch "$current_branch"' EXIT INT TERM

git switch main
git merge dev
git push origin main
git switch dev

trap - EXIT INT TERM
