# Contributing

ValGuide is being prepared for its first public release. Until the initial public commit is finalized, treat the repo as review-in-progress.

## Ground Rules

- Do not commit real secrets, customer data, or provider account identifiers.
- Keep deployment-specific or operator-only material in `valguide-workspace`, not here.
- Prefer small, reviewable changes with tests when behavior changes.

## Local Setup

1. Install `Node.js >=24` and `pnpm@10`.
2. Copy the `*.example` env files you need to their matching local filenames.
3. Run `pnpm install`.
4. Start a target with `./val dev <target>`.

## Checks

Run these before opening a PR:

```bash
./val lint
./val type-check
./val test
```

If you change Cloudflare app bindings, regenerate the local Worker types:

```bash
pnpm --filter @valguide/app cf-typegen
pnpm --filter @valguide/admin cf-typegen
pnpm --filter @valguide/studio cf-typegen
pnpm --filter @valguide/www cf-typegen
pnpm --filter @valguide/links cf-typegen
pnpm --filter @valguide/docs cf-typegen
```
