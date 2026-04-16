---
title: "ValGuide – Emotionally Safe UI/UX Guidelines"
---

> **Purpose**
> This document defines the UX and interaction principles for ValGuide.
> It serves as a shared reference for humans and AI agents working on the codebase.
>
> The goal is to ensure that ValGuide feels **safe, calm, and trustworthy**—especially for non-technical, risk-averse users working in public-facing cultural institutions.

---

## Core Definition

Emotionally safe UI/UX means designing flows, copy, defaults, and system behavior so users feel:

* **In control** (nothing happens without intent)
* **Not judged** (mistakes are normal and recoverable)
* **Not trapped** (there is always a way back)
* **Confident to explore** without fear of breaking something

This is especially critical when users are:

* New to the system
* Under time pressure
* Unsure about publishing or public visibility
* Interacting with AI-generated content

---

## UX Goals

1. Reduce anxiety and confusion
2. Increase clarity, trust, and predictability
3. Support learning through safe exploration
4. Prevent shame, blame, or fear-driven behavior
5. Build user confidence over time—not just task completion

---

## Core Principles

### 1. Clarity Over Cleverness

* Prefer plain, human language over technical or internal terms
* Navigation and actions should be predictable and boring
* Always surface the obvious next step
* Show system status clearly (saving, loading, publishing)

**Rule:** If something is clever but unclear, it is wrong.

---

### 2. User Control and Reversibility

* Favor undo, back, cancel, and draft states
* Confirm only truly destructive or irreversible actions
* Explain consequences *before* committing
* Preserve user input whenever possible

**Rule:** Users should never feel locked into a decision.

---

### 3. Non-Judgmental Microcopy

* Avoid language like: *invalid*, *failed*, *incorrect* without explanation
* Never imply user fault
* Use supportive, neutral phrasing

Good pattern:

* What happened
* Why it happened (if known)
* What the user can do next

**Rule:** The system is responsible for helping the user succeed.

---

### 4. Gentle Error Handling

* Validate inline and early (before submission)
* Highlight exactly what needs attention
* Never clear user input on error
* Provide a clear recovery path (retry, edit, contact support)

**Rule:** Errors are part of normal use, not exceptional failures.

---

### 5. Transparency and Trust

* Clearly surface pricing, limits, trials, and renewals *before* surprise moments
* Explain permissions and data usage just-in-time
* Avoid hidden behavior or implicit side effects

**Rule:** Nothing important should be discovered accidentally.

---

### 6. Reduce Overwhelm

* Use progressive disclosure instead of showing everything at once
* Provide sensible defaults and templates
* Allow onboarding to be skipped or revisited
* Avoid aggressive modals and alert storms

**Rule:** Perceived simplicity matters more than actual simplicity.

---

### 7. Respect User Time and Attention

* No dark patterns
* No forced opt-ins or confusing cancellation flows
* Support fast paths for experienced users
* Support guided paths for new users

**Rule:** Efficiency should never come at the cost of trust.

---

### 8. Accessibility and Inclusivity by Default

* Sufficient contrast and readable typography
* Keyboard and screen-reader friendly flows
* Never rely on color alone to convey meaning
* Use icons *with* text, not instead of text

**Rule:** Accessibility is a baseline, not a feature.

---

## ValGuide-Specific Principles

### 9. Private by Default, Public by Intent

* All creation starts in a private or draft state
* Publishing is a deliberate, explained action
* Always indicate where content is visible (draft / team / visitors)
* Provide accurate previews of the visitor experience

**Rule:** Nothing becomes public without explicit user intent.

---

### 10. AI as Collaborator, Not Authority

* Clearly label AI-generated content
* Default AI output to draft or suggestion states
* Encourage review, editing, and ownership
* Avoid absolute or overconfident AI phrasing
* Make it easy to reject or modify AI output without penalty

**Rule:** The user remains the author and final authority.

---

## Agent Decision Heuristics

When an AI agent or system component is unsure how to proceed, default to:

1. Explaining what will happen before acting
2. Asking permission instead of assuming intent
3. Choosing reversible actions
4. Leaving visible traces of what changed
5. Offering an undo, review, or preview path

---

## High-Impact Touchpoints to Audit

These areas require extra care and must strictly follow this document:

* Onboarding and first-run experience
* Empty states and first success moments
* Publishing and unpublishing flows
* Billing, upgrades, downgrades, and cancellation
* Data deletion and workspace removal
* Permissions, invites, and role changes
* Import/export and migration flows
* Error states (authentication, payments, integrations, rate limits)

---

## Final Guiding Question

At every UX or system decision, ask:

> **“Would a careful, slightly anxious user feel safe doing this?”**

If the answer is not a clear yes, the design needs adjustment.

---

**This document is normative.**
All new features, flows, and agent behaviors should be evaluated against it.
