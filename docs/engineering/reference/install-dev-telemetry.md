---
title: "Install And Dev Telemetry"
---

ValGuide tracks anonymous usage signals so maintainers can understand whether
contributors install the local CLI, start development targets, and run hosted
deployments with analytics enabled.

## Signals

Local CLI telemetry sends only coarse events:

| Event | Trigger | Properties |
|-------|---------|------------|
| `val.install.completed` | `pnpm val:setup` completes | whether the configured bin directory is already on `PATH` |
| `val.dev.started` | `val dev` starts local development | target count, all/remote/offline mode, selected database environment |

The CLI does not send command arguments, target names, file paths, environment
values, repository paths, git remotes, project data, personal data, or secrets.
Events use an anonymous UUID stored in `~/.config/valguide/telemetry.json`.

Hosted usage is measured through the existing PostHog product analytics path
when `VITE_POSTHOG_ENABLED=true` and a public PostHog key/host are configured
for the deployment. Self-hosted deployments can leave analytics disabled.

## Opt Out

Use any of these options:

```sh
val telemetry disable
VALGUIDE_TELEMETRY_DISABLED=1 val dev studio
VALGUIDE_TELEMETRY_ENABLED=0 val dev studio
```

`val telemetry enable` removes the local opt-out. CI environments are skipped
automatically.

## Configuration

CLI telemetry is active only when one of these public PostHog project-key
variables is present:

- `VALGUIDE_TELEMETRY_KEY`
- `POSTHOG_PROJECT_KEY`
- `VITE_POSTHOG_KEY`

The endpoint is PostHog EU capture. Network failures are ignored and never fail
the developer command.
