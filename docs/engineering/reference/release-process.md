# Release Process

Public releases are created from `ValGuide/valguide` with the `Release`
GitHub Actions workflow.

The release workflow creates a semver tag and GitHub Release only. It does not
deploy hosted ValGuide infrastructure, configure Cloudflare, or notify Slack.
Hosted production deployment is handled by private deployment orchestration
that consumes a release tag after verifying public CI for the exact commit.

## Maintainer Flow

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

## Rules

- Tags use `vX.Y.Z` semver format, with optional prerelease suffixes such as
  `vX.Y.Z-rc.1`.
- The release workflow refuses to create a release when the required `CI`
  workflow has not passed for the exact target SHA.
- The release workflow uses only GitHub's repository token with `contents:
  write` and `actions: read` permissions.
- Hosted deployment credentials and hosted deployment variables do not belong in
  this public repo.

## Production Promotion

Private deployment automation treats public releases as production deployment
inputs. A production deploy should check out the exact release tag, verify the
same public CI gate for the tag's commit, and then deploy from private
infrastructure with private secrets and variables.
