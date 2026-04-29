# Contributing

ValGuide is being prepared for its first public release. Until the initial
public commit is finalized, treat the repo as review-in-progress, but make
contributions as if this were a normal public open-source repository.

You do not need untracked local files, private runbooks, private env files, or
ValGuide-owned provider accounts to contribute product code, docs, tests, or
design-system work in this repository.

## Ground Rules

- Do not commit real secrets, customer data, provider account identifiers, or
  private deployment material.
- Keep deployment-specific or operator-only material outside this public
  repository.
- Prefer small, reviewable changes with tests when behavior changes.
- Keep comments, docs, examples, and reviews respectful, inclusive, and focused
  on the work.
- Follow the ValGuide
  [Code of Conduct](https://github.com/valguide/.github/blob/main/CODE_OF_CONDUCT.md)
  in issues, pull requests, discussions, and project spaces.

## Local Setup

Prerequisites:

- Node.js `>=24`
- `pnpm@10`

From a fresh clone:

```bash
pnpm install
cp .env.local.example .env.local
./val dev studio --offline
```

The public repo ships example env files only. Copy the examples you need to
local, untracked env files and replace placeholders with your own local values.
Do not copy private files from another workspace.

Useful local commands:

```bash
./val help
./val targets
./val dev <target> --offline
./val dev --all --no-open --offline
./val type-check
./val test
./val lint
```

`--offline` keeps local bindings and the local database selected. Remote
Cloudflare bindings or hosted databases require your own provider configuration.

## Branches, Issues, And Commits

- Open an issue before larger work so maintainers can confirm scope.
- Branch from the active development branch. During launch preparation, that is
  `dev`.
- Use short, descriptive branch names such as `vg-331-update-contributing` or
  `fix-login-redirect`.
- Keep each pull request focused on one behavior change, docs update, or
  cleanup.
- Use Conventional Commit style for commit messages, for example
  `fix(studio): handle empty media titles` or `docs: clarify local setup`.
- Include tests or verification notes when behavior changes.

## Pull Requests

Before opening a PR:

```bash
pnpm secrets:check
./val lint
./val type-check
./val test
```

Use targeted checks when a full run is unnecessary or too slow:

```bash
./val type-check studio
./val test core
./val lint fix
```

In the PR description, include:

- What changed and why
- Screenshots or recordings for visible UI changes
- The checks you ran
- Any follow-up work that is intentionally left out

If you change Cloudflare app bindings, regenerate the local Worker types:

```bash
pnpm --filter @valguide/app cf-typegen
pnpm --filter @valguide/admin cf-typegen
pnpm --filter @valguide/studio cf-typegen
pnpm --filter @valguide/www cf-typegen
pnpm --filter @valguide/links cf-typegen
pnpm --filter @valguide/docs cf-typegen
```

## Public Repository Hygiene

- Use `*.example` files and placeholders for environment values.
- Do not commit generated local config, local env files, Terraform state,
  database dumps, logs, cache files, or screenshots that contain private values.
- Scrub screenshots, recordings, fixtures, and logs for cookies, auth headers,
  private URLs, personal email addresses, internal IDs, provider account IDs,
  and local file paths before sharing them.
- Do not commit `wrangler.generated.jsonc` or other generated deploy config.
- If you accidentally expose a secret, stop using it, rotate it, and report it
  privately instead of only deleting it from the branch.

Security issues, leaked credentials, conduct reports, and other sensitive
reports should not be opened as public issues. Email
[support@valguide.com](mailto:support@valguide.com).
