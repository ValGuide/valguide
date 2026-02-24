---
name: plan-review
description: "Reviews plans and designs before implementation. Use when asked to review a plan, audit a design, or evaluate an approach before building."
---

# Plan Review

Review plans thoroughly before making any code changes. For every issue or recommendation, explain the concrete tradeoffs, give an opinionated recommendation, and ask for input before assuming a direction.

## Engineering Preferences

Use these to guide all recommendations:

- **DRY is important** — flag repetition aggressively
- **Well-tested code is non-negotiable** — rather too many tests than too few
- **"Engineered enough"** — not under-engineered (fragile, hacky) and not over-engineered (premature abstraction, unnecessary complexity)
- **Handle edge cases** — err on the side of more, not fewer; thoughtfulness > speed
- **Explicit over clever** — bias toward readability

Full guidelines: `docs/plan-review-guidelines.md`

## Before Starting

Ask which review mode the user wants:

1. **BIG CHANGE**: Work through interactively, one section at a time (Architecture → Code Quality → Tests → Performance) with at most **4 top issues** per section
2. **SMALL CHANGE**: Work through interactively **one question per review section**

## Review Stages

Work through these in order, pausing after each for feedback:

### 1. Architecture Review
- Overall system design and component boundaries
- Dependency graph and coupling concerns
- Data flow patterns and potential bottlenecks
- Scaling characteristics and single points of failure
- Security architecture (auth, data access, API boundaries)

### 2. Code Quality Review
- Code organization and module structure
- DRY violations — be aggressive
- Error handling patterns and missing edge cases (call out explicitly)
- Technical debt hotspots
- Over-engineered or under-engineered areas

### 3. Test Review
- Test coverage gaps (unit, integration, e2e)
- Test quality and assertion strength
- Missing edge case coverage — be thorough
- Untested failure modes and error paths

### 4. Performance Review
- N+1 queries and database access patterns
- Memory-usage concerns
- Caching opportunities
- Slow or high-complexity code paths

## Issue Reporting Format

For every specific issue (bug, smell, design concern, or risk):

1. **Describe the problem concretely**, with file and line references
2. **NUMBER** each issue (1, 2, 3…)
3. **Present 2–3 options** with **LETTERS** (A, B, C…), including "do nothing" where reasonable
4. **Recommended option is always A** — make it first
5. For each option specify: implementation effort, risk, impact on other code, maintenance burden
6. Give recommended option and why, mapped to preferences above
7. **Ask explicitly** whether user agrees or wants a different direction before proceeding

## Workflow Rules

- Do not assume priorities on timeline or scale
- After each section, **pause and ask for feedback** before moving on
- Clearly label everything as "Issue NUMBER, Option LETTER" so nothing is ambiguous
