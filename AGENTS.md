# Agent Instructions

ValGuide is an open-source, public repository. Treat every committed file,
comment, screenshot, log excerpt, fixture, and generated artifact as visible to
contributors and downstream users.

## Automation Labels

Do not add the `codex:auto` label to GitHub or Linear work items unless the
user explicitly asks for the Hetzner Codex runner to execute the ticket. That
label is an execution trigger, not a normal classification label.

## Public Boundaries

- Do not commit real secrets, access tokens, passwords, private keys, customer
  data, provider account identifiers, private deployment state, or local
  operator notes.
- Keep private operational material outside this repository. Use committed
  `*.example` files, documented environment variable names, and placeholders
  instead of real values.
- Do not add generated local config such as `wrangler.generated.jsonc`,
  `.env-merged/`, `.wrangler/`, Terraform state, local database dumps, or
  absolute paths from a private machine.
- Scrub screenshots and logs before committing them. Remove tokens, cookies,
  private URLs, personal email addresses, internal IDs, and local file paths.
- Public docs should explain reproducible contributor workflows without
  depending on private operator scripts or private infrastructure access.

## Conduct

Write and review as if speaking to a public contributor. Keep comments,
documentation, examples, and review notes respectful, inclusive, and focused on
the technical work. Do not add discriminatory, harassing, or needlessly personal
content.

## Checks

Run the relevant checks before handing work back:

```bash
pnpm secrets:check
pnpm lint:error
pnpm type-check
pnpm test
```

For narrow changes, use the closest package or target-specific check when the
full suite is not practical. The secret scan is intentionally cheap and should
run before commits and pull requests.

## Storybook Coverage

User-facing UI work is incomplete without relevant Storybook coverage.

- Add or update stories for every materially changed reusable component.
- Cover important visual states that apply to the component, including default,
  empty, loading, error, disabled or busy, long-content, and responsive states.
- Prefer stories for presentational boundaries. Keep server functions, live
  queries, and router wiring in thin connected wrappers rather than duplicating
  application infrastructure inside Storybook.
- When a connected component cannot reasonably render in Storybook, document
  the reason and add coverage for its nearest reusable presentational component.
- Update existing parent-shell stories when a feature changes visible shell
  state such as navigation items, badges, banners, or dialogs.
- Run `pnpm --filter @valguide/storybook type-check` and, when practical,
  `pnpm storybook:build` before handing back UI changes.
