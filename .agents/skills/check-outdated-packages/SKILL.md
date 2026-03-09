---
name: check-outdated-packages
description: Checks outdated dependencies in this pnpm monorepo with `pnpm outdated -r` and recommends how to proceed based on the specific libraries that are behind. Use when asked to review outdated packages, dependency upgrades, or update risk.
---

# Check Outdated Packages

Use this skill when the user wants a dependency audit or asks what to upgrade next.

## Workflow

1. Run `pnpm outdated -r` from the repo root.
2. If the output is empty, report that the workspace is up to date.
3. Group results by upgrade risk instead of listing them in raw CLI order.
4. Recommend a concrete next step for each group.
5. Only propose install or upgrade commands if the user asks to proceed.

## How To Analyze

Classify each outdated package into one of these buckets:

- `Safe batch`
  Use for patch updates and low-risk minor updates on leaf utilities with no build or runtime surface.
  Recommendation: update together in one PR, then run targeted tests.

- `Framework minor`
  Use for minor updates to libraries that shape app behavior, builds, routing, auth, styling, testing, or database access.
  Examples: React, TanStack, Vite, Vitest, Jest, Storybook, Hono, Better Auth, Drizzle, Tailwind, Biome, TypeScript.
  Recommendation: update in small batches by ecosystem, verify changelog highlights, then run the relevant app test/build checks.

- `Major review required`
  Use for all major version jumps.
  Recommendation: do not batch blindly. Check breaking changes, isolate the package in its own PR unless tightly coupled to sibling packages from the same ecosystem.

- `Hold for now`
  Use when the package is unused, duplicated by another tool, blocked by another upgrade, or likely to create churn without clear value.
  Recommendation: explain why it should wait.

## Package-Specific Heuristics

- If multiple packages belong to the same ecosystem, suggest upgrading them together.
  Examples: TanStack Router + Query, Storybook packages, Drizzle packages, React ecosystem packages.

- Treat these as higher-risk even on minor releases:
  `react`, `react-dom`, `@tanstack/*`, `@tanstack/react-router*`, `vite`, `@vitejs/*`, `typescript`, `better-auth`, `drizzle-*`, `tailwindcss`, `storybook`, `jest`, `@biomejs/biome`.

- Treat these as potentially safe to batch when only patch/minor:
  formatting helpers, utility libraries, type-only helpers, small SDKs that are not on the critical request path.

- If a package looks important but its role is unclear, run `pnpm why -r <package>` before recommending a path.

- If a major update affects auth, routing, DB, build tooling, or test tooling, explicitly call out the blast radius.

## Response Format

Keep the answer decision-oriented. Use this structure:

```md
## Outdated Packages

### Safe batch
- `package-a` `1.2.3 -> 1.2.5`

### Framework minor
- `package-b` `4.1.0 -> 4.3.0`

### Major review required
- `package-c` `2.9.0 -> 3.0.0`

## Recommendation

1. [First upgrade step]
2. [Second upgrade step]
3. [What to hold or investigate separately]
```

## Decision Rules

- Prefer fewer, coherent upgrade batches over one giant dependency sweep.
- Separate runtime/framework updates from tooling updates when both are present.
- Separate database/auth upgrades from UI-only upgrades.
- If several major updates appear at once, recommend sequencing them rather than doing all of them together.
- If the user asks for a plan, propose the order of upgrades first; do not start changing `package.json` files automatically.
