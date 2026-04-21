---
title: "Nx Workspace Reference"
---

ValGuide uses Nx for workspace orchestration on top of `pnpm` workspaces.

## What Nx owns here

- task orchestration for repo-wide commands like `build`, `type-check`, `test`, and `clean`
- long-running dev and preview targets through Nx `continuous` targets
- cacheable task metadata, outputs, and dependency ordering
- affected execution in CI

## Where the config lives

- Root config: [`nx.json`](/workspace/valguide/nx.json)
- Project target metadata: each app/package `package.json` under the `nx.targets` key
- Human-friendly command surface: [`scripts/val.mjs`](/workspace/valguide/scripts/val.mjs)

## Environment variables

When you add a new environment variable that changes task behavior, update [`nx.json`](/workspace/valguide/nx.json) in `namedInputs.sharedGlobals`.

That keeps Nx task hashing aligned with env-sensitive builds and prevents stale cache results.

## Common commands

```bash
./val dev studio
./val build app
./val preview docs
./val type-check
pnpm exec nx show projects
pnpm exec nx affected -t build
```

## Output modes

Nx defaults to its terminal UI for local multi-task runs. If you need plain streamed logs instead:

```bash
pnpm exec nx run-many -t dev --projects=@valguide/app,@valguide/studio --outputStyle=stream
```
