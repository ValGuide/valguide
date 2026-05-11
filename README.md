# ValGuide

ValGuide is an open-source platform for museums, cultural institutions, civic
spaces, campuses, and other visitor-facing organizations that need to publish
and operate digital experiences on the web.

The project brings together a visitor app, curator-facing studio, admin tools,
publishing workflows, QR and short-link entry points, analytics-ready product
surfaces, and deployment scaffolding. Digital tours and audio guides are an
important part of the platform, but they are not the whole system.

ValGuide has been in active development since April 2025.

## What ValGuide Is For

- Web-first visitor guides, tours, and interpretive experiences
- Exhibition and venue content that can change without app-store releases
- Curator workflows for content, media, localization, and publishing
- QR-driven entry points and short links for physical spaces
- Institution-owned deployments that can be self-hosted or adapted
- Engineering experiments around cultural, educational, and civic technology

## AI And Institution Tooling

ValGuide is also a practical codebase for experimenting with AI-assisted tools
for cultural institutions. The current focus is concrete: keeping the product
maintainable for agent-assisted engineering, documenting boundaries clearly, and
leaving room for future AI workflows such as editorial drafting, localization
support, internal operations, and visitor-facing assistance.

AI features should support institutional review and publishing workflows rather
than replacing curatorial judgment.

## Repository Layout

- `apps/app`: visitor-facing web experience
- `apps/studio`: curator-facing content and publishing studio
- `apps/admin`: administrative tooling
- `apps/www`: public website
- `apps/links`: QR and short-link handler
- `apps/docs`: documentation site
- `apps/storybook`: interactive component documentation and visual review workspace
- `packages/core`: shared product, data, and platform code
- `packages/email`: email templates and delivery helpers
- `packages/icons`: icon build tooling
- `packages/logger`: shared logging utilities
- `docs/`: public product, design, and engineering documentation

## Local Development

Prerequisites:

- Node.js `>=24`
- `pnpm@10`

```sh
git clone https://github.com/valguide/valguide.git
cd valguide
pnpm install
cp .env.local.example .env.local
./val dev studio
```

The `./val` CLI can start, build, test, and preview individual targets:

```sh
./val help
./val targets
./val dev --all --no-open
./val type-check
./val test
./val lint
```

This public repository does not include real secrets. For local setup, copy the
example env files you need and provide private values through your shell,
dotenv tooling, CI, or provider secret stores.

Useful project resources:

- [Environment variables](./docs/engineering/reference/environment-variables.md)
- [Deployment configuration](./docs/engineering/reference/deployment-configuration.md)
- [Release process](./docs/engineering/reference/release-process.md)
- [Documentation overview](./docs/overview.md)
- [Storybook](https://storybook.valguide.dev): interactive component documentation
  and visual review workspace

## Self-Hosting

ValGuide's current deployment model is built around Cloudflare Workers,
PostgreSQL, provider-side secrets, and generated Wrangler configuration. The
checked-in config files are public-safe local baselines; production deploys use
generated config and secrets supplied outside Git.

For self-hosting, see
[Deployment configuration](./docs/engineering/reference/deployment-configuration.md)
and copy `.env.selfhost.example` to `.env.selfhost` before generating deploy
configuration.

## Contributing

ValGuide is open source and welcomes focused contributions. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) before opening an issue or pull request,
and keep changes small enough to review.

Security issues, leaked credentials, conduct reports, and other sensitive
reports should not be opened as public issues. Email
[support@valguide.com](mailto:support@valguide.com).

## License

ValGuide is licensed under `AGPL-3.0-only`. See [LICENSE](./LICENSE).
