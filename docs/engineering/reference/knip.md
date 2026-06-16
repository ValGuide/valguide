# Knip Dependency And Dead Code Checks

Knip checks this pnpm/Nx workspace for unused files, unused exports, unused dependencies, unlisted dependencies, unresolved imports, duplicate exports, and related package hygiene issues.

## Common Commands

Run the default report locally:

```bash
pnpm knip
```

Run the same full production report used by CI:

```bash
pnpm knip:ci
```

Use focused reports when triaging a package or pull request:

```bash
pnpm knip:deps
pnpm knip:files
pnpm knip:exports
pnpm knip:production
pnpm knip:strict
```

For resolver debugging, use:

```bash
pnpm knip:debug -- --trace-file apps/studio/src/routes/__root.tsx
pnpm knip -- --trace-dependency react
```

## Baseline Policy

`knip.jsonc` is workspace-aware and keeps framework conventions explicit: TanStack Router generated route trees, public service workers, static font theme files, Storybook setup, worker entrypoints, and root maintenance scripts are configured as entrypoints or narrow ignores.

CI gates Knip's full default production report, including unused files, dependencies, unlisted dependencies, unresolved imports, unused exports, unused exported types, duplicate exports, binaries, and related issue types. Dev-only files and dependencies remain outside the CI gate through `--production`; use `pnpm knip` or the focused commands below when reviewing the entire workspace.

When Knip reports a new issue, prefer fixing the code or package manifest. If the report is a framework convention or another confirmed false positive, add the narrowest possible config entry:

- use `entry` for a file that is executed by a tool or framework,
- use `ignoreFiles` only for generated or externally referenced assets,
- use `ignoreDependencies`, `ignoreBinaries`, or `ignoreUnresolved` only for exact package or binary names,
- avoid directory-wide ignores unless the directory is generated output.

## Auto-Fix Workflow

Knip can modify package manifests and exports:

```bash
pnpm knip:fix
```

File deletion is intentionally a separate command:

```bash
pnpm knip:fix:files
```

Only run `knip:fix:files` after reviewing the `pnpm knip:files` output and confirming that the files are truly dead. CI runs reporting only and never deletes files.
