---
name: studio-login-verification
description: Verifies the Studio login flow with the repo’s Val CLI. Use when asked to test Studio login, OTP auth, or Playwright auth flows in this repo. Prefer `val verify studio` and `val dev studio` from the repo root instead of legacy `pnpm` script names or ad hoc Playwright steps.
---

# Studio Login Verification

Use this skill for Studio authentication checks in this repository.

## Default Workflow

Run the Val CLI workflow from the repo root:

```bash
val dev studio
val verify studio
```

Add `-- --ticket <ID>` when the user gives a ticket or wants artifacts grouped under a specific run folder.

## Rules

1. Do not replace this flow with manual Playwright browser steps unless the user explicitly asks for manual debugging.
2. Treat `val dev studio` as the canonical way to get the local Studio app running.
3. Treat `val verify studio` as the canonical Playwright check. It delegates to the guarded Studio verification flow and performs the real login flow plus the protected-route smoke test.
4. If `tmp/studio-agent-runtime.json` already exists, read it for the current runtime state before deciding whether any deeper runtime/bootstrap debugging is needed.
5. Report the important outputs, not raw command spam: whether login succeeded, which routes were verified, and where artifacts were written.

## Important Files

- Runtime state: `tmp/studio-agent-runtime.json`
- Verification guide: `docs/dev-auth-playwright.md`
- Start script: `scripts/studio-agent/start.mjs`
- Verify script: `scripts/studio-agent/verify.mjs`

## Response Expectations

- Mention that the test is being run through the repository’s Val CLI Studio verification flow.
- If local dev setup or runtime bootstrap fails, summarize the failing preflight/post-start checks from `tmp/studio-agent-runtime.json`.
- If the verify step fails, summarize where the flow stopped and point to the artifact directory.
