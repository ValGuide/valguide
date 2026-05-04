---
name: local-secret-scan
description: Run local secret leak checks with Gitleaks and TruffleHog before open-sourcing, publishing, pushing, or creating a release. Use when Codex needs to audit a repository worktree or Git history for leaked tokens, private keys, credentials, or sensitive env values without printing secret material.
---

# Local Secret Scan

## Overview

Audit a repository locally with layered secret scanners. Prefer output that reports file paths and detector metadata, and avoid printing matched secret values.

## Workflow

1. Start from the repository root.

2. Check that required tools are installed:

```bash
command -v gitleaks
command -v trufflehog
```

If either tool is missing on macOS and Homebrew is available, ask for approval before installing:

```bash
brew install gitleaks trufflehog
```

3. If the repo has a fast project-specific scanner, run it first. In ValGuide this is:

```bash
pnpm secrets:check
```

4. Run Gitleaks against Git history with redaction:

```bash
gitleaks git --redact --verbose .
```

5. Run TruffleHog against local Git history:

```bash
trufflehog git file://. --results=verified,unknown --fail
```

6. If scanning only staged changes is requested, use the project-specific scanner when available:

```bash
pnpm secrets:check --staged
```

## Reporting

Summarize pass/fail status, tool versions, and file paths or detector names only. Do not paste matched secret values, full suspicious lines, tokens, cookies, private key material, database URLs, or env file contents into the conversation.

If a scanner reports a likely real secret:

1. Stop before publishing or pushing.
2. Report the affected path, detector, and remediation class.
3. Recommend revoking or rotating the credential even if it has not been pushed publicly.
4. Remove the secret from the worktree and, if present in history, rewrite the history before making the repo public.

## Notes

- Prefer `--redact` for Gitleaks.
- Prefer `--results=verified,unknown` for TruffleHog to avoid hiding unverified but plausible leaks.
- Run scans from the public repo root when preparing an open-source repository; do not scan private workspace folders and then copy private paths or findings into public docs.
- The local scanner is a pre-publication guard, not a substitute for GitHub secret scanning and push protection.
