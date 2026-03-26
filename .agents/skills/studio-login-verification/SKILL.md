---
name: studio-login-verification
description: Verifies the Studio login flow with the guarded root-level agent workflow. Use when asked to test Studio login, OTP auth, or Playwright auth flows in this repo. Prefer `pnpm studio:agent:start` and `pnpm studio:agent:verify` from the repo root instead of ad hoc Playwright steps.
---

# Studio Login Verification

Use this skill for Studio authentication checks in this repository.

## Default Workflow

Run the guarded root-level commands from the repo root:

```bash
pnpm studio:agent:start
pnpm studio:agent:verify
```

Add `-- --ticket <ID>` when the user gives a ticket or wants artifacts grouped under a specific run folder.

## Rules

1. Do not replace this flow with manual Playwright browser steps unless the user explicitly asks for manual debugging.
2. Treat `pnpm studio:agent:start` as the canonical setup step. It bootstraps the approved local auth state, starts Caddy and Studio, and writes runtime state.
3. Treat `pnpm studio:agent:verify` as the canonical Playwright check. It performs the real login flow and protected-route smoke test.
4. If `tmp/studio-agent-runtime.json` already exists, read it for the current runtime state, but still prefer rerunning the guarded commands when the user asks to test the flow now.
5. Report the important outputs, not raw command spam: whether login succeeded, which routes were verified, and where artifacts were written.

## Important Files

- Runtime state: `tmp/studio-agent-runtime.json`
- Verification guide: `docs/dev-auth-playwright.md`
- Start script: `scripts/studio-agent/start.mjs`
- Verify script: `scripts/studio-agent/verify.mjs`

## Response Expectations

- Mention that the test is being run through the repository’s guarded Studio agent flow.
- If the start step fails, summarize the failing preflight/post-start checks from `tmp/studio-agent-runtime.json`.
- If the verify step fails, summarize where the flow stopped and point to the artifact directory.
