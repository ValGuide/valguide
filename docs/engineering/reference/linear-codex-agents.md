---
title: "Linear Codex Agents"
---

ValGuide's Linear-triggered Codex agents create branches and pull requests from
the GitHub identity configured on the agent host. The expected public GitHub
account for these automated pull requests is `codex-valguide`.

## Linear Triggers

The agent host should enqueue a VPS Codex run from either of these Linear
events:

- An issue is in the configured in-progress state and has the `codex:auto`
  label.
- A new Linear comment on an issue mentions `@codex-valguide`.

The comment trigger is intended for follow-up work on an existing ticket. The
Linear webhook must include `Comment` creation events, not only issue create or
issue update events. The service should ignore edited comments, deleted
comments, and comments that do not mention one of the configured handles.

Configure the accepted handles with `LINEAR_COMMENT_MENTION_HANDLES` as a
comma-separated list. Leave it unset to use the default `@codex-valguide`.

When a comment starts a run, the worker passes the issue context and triggering
comment to Codex:

```sh
LINEAR_ISSUE_ID
LINEAR_ISSUE_IDENTIFIER
LINEAR_ISSUE_TITLE
LINEAR_ISSUE_DESCRIPTION
LINEAR_TRIGGER_COMMENT_BODY
```

If Linear sends a comment payload without complete issue details, the service
needs `LINEAR_API_KEY` so it can resolve the commented issue before deciding
whether to enqueue the job.

## Pull Request Identity

The agent host must authenticate GitHub CLI and git push operations as
`codex-valguide`. Do not use a personal maintainer account for automated pull
requests.

On the agent host, verify the active GitHub CLI account before enabling the
worker:

```sh
gh auth status -h github.com
gh api user --jq .login
```

Both commands should report `codex-valguide`. If they report another user,
replace the GitHub token used by the agent service with a token owned by
`codex-valguide`.

## Service Environment

The Linear/Codex service may export `GITHUB_TOKEN` or `GH_TOKEN` for GitHub CLI.
Those environment variables override the account stored by `gh auth login`.
Set them only to a token owned by `codex-valguide`, or leave them unset when the
service user already has a valid `gh` login for `codex-valguide`.

After changing the token, restart the agent services and run:

```sh
gh api user --jq .login
```

from the same Unix user and environment that runs the agent worker. The output
must be `codex-valguide` before accepting new Linear jobs.
