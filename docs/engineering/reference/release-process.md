# Release Process

Public releases are created from `ValGuide/valguide`.

The public repository owns CI, semantic release tags, GitHub Releases, and
public GitHub Deployment history. Hosted deployment config, Cloudflare
credentials, Slack credentials, and actual deployment execution live in private
deployment orchestration.

## Branch Model

`dev` is the integration branch and source for hosted dev deploys. `main` is the
stable branch and source for production releases.

Both branches run public CI. Release/deploy automation runs only after CI passes
and only when the exact head commit message includes an explicit marker.

## Dev Prerelease And Deploy

Pushes to `dev` create a dev prerelease and deploy only when the head commit
message includes an explicit build marker:

- `[build all]`
- `[build apps]`
- `[build app studio]`
- `[build docs]`
- `[build workers]`

`[deploy ...]` is accepted as a backwards-compatible alias. No marker means no
release and no deploy.

After successful `CI`, the `Commit Release Deploy` workflow:

1. parses the build marker from the exact head commit
2. calculates the next semantic prerelease tag, such as `v1.4.0-dev.7`
3. creates a GitHub Release marked as a prerelease
4. dispatches the private deploy repository with the exact source SHA, release
   tag, environment `dev`, and requested scope
5. the private deploy repository verifies public CI for the exact source, runs
   the deploy, sends Slack notification, and writes public GitHub Deployment
   status back to this repository

## Production Release And Deploy

Production releases start from `main`. Add an explicit release marker to the
head commit message on `main`:

- `[release all]`
- `[release apps]`
- `[release app studio]`
- `[release docs]`
- `[release workers]`

After successful `CI`, the workflow calculates the next stable semantic version
from conventional commits since the latest stable tag, creates the stable
`vMAJOR.MINOR.PATCH` GitHub Release, dispatches the private deploy repository
with environment `prod`, and the private repository deploys the requested scope
from that exact release tag.

`[release ...]` markers on `dev` are rejected. `[build ...]` and `[deploy ...]`
markers on `main` are rejected.

## Versioning

Stable releases use `vMAJOR.MINOR.PATCH`.

Dev prereleases use `vMAJOR.MINOR.PATCH-dev.N`. The stable base is inferred
from conventional commits since the latest stable tag:

- breaking change: `type!:` / `type(scope)!:` or `BREAKING CHANGE:` -> major
- feature: `feat:` -> minor
- bug fix or performance fix: `fix:` or `perf:` -> patch
- docs, chore, ci, refactor, style, and test-only changes do not create a
  release by default

If a build marker is present but the commit range contains no releasable
conventional commits, the workflow fails clearly instead of inventing a
version.

## Manual Stable Release Flow

The `Release` GitHub Actions workflow remains available as an escape hatch when
creating a release without commit-message dispatch.

1. Ensure the target commit has a successful `CI` workflow run.
2. Open the `Release` workflow in GitHub Actions.
3. Run the workflow manually with:
   - `version`: semver version such as `1.2.3` or `v1.2.3`.
   - `target_ref`: branch, tag, or commit SHA to release. Use `main` for the
     normal stable release path.
   - `prerelease`: `true` for prerelease tags such as `v1.2.3-rc.1`.
   - `draft`: `true` when the release notes need review before publication.
4. The workflow validates the version, verifies public CI for the exact target
   SHA, creates the `vX.Y.Z` tag, and publishes the GitHub Release.

## CI/CD Boundary

- Tags use `vX.Y.Z` semver format, with optional prerelease suffixes such as
  `vX.Y.Z-dev.7` or `vX.Y.Z-rc.1`.
- Public workflows refuse to release or deploy when the required `CI` workflow
  has not passed for the exact target SHA.
- The public commit dispatch workflow needs only
  `VALGUIDE_DEPLOY_DISPATCH_TOKEN`, a narrow token that can create
  `repository_dispatch` events in the private deploy repository.
- Hosted deployment credentials and hosted deployment variables do not belong in
  this public repo.

## Production Promotion

Private deployment automation treats public releases as production deployment
inputs. A production deploy checks out the exact release tag, verifies the same
public CI gate for the tag's commit, and then deploys from private
infrastructure with private secrets and variables.
