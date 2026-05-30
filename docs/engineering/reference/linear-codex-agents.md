---
title: "Linear Codex Agents"
---

ValGuide's Linear-triggered Codex agents create branches and pull requests from
the GitHub identity configured on the agent host. The expected public GitHub
account for these automated pull requests is `codex-valguide`.

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
