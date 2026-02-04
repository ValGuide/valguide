---
name: reviewing-ux
description: Reviews UI designs and implementations using the Status/Scope/Action model. Use when evaluating UX, reviewing component designs, or assessing user flows.
---

# Reviewing UX

Reviews UI implementations for polish, trust signals, and micro-details that build user confidence.

## Core Principle

**Polish isn't vanity—it's how users judge the entire system.** Users unconsciously equate frontend smoothness with backend reliability.

**Reference Documentation** (read before reviewing):
- `docs/ux/ux-guide.md` — Status/Scope/Action model and UX best practices
- `docs/ux/ux-polish-principles.md` — Trust signals and micro-details checklist
- `docs/ux/ux-emotional-safety.md` — Emotionally safe design for risk-averse users

## Review Framework: Status / Scope / Action

For each issue found, classify it:

| Status | Meaning |
|--------|---------|
| ✅ Good | Meets standards |
| ⚠️ Minor | Noticeable but not urgent |
| 🔴 Critical | Breaks trust, fix immediately |

| Scope | Examples |
|-------|----------|
| Feedback | Hover states, press states, loading indicators |
| Continuity | Page transitions, layout stability, state preservation |
| Rhythm | Spacing, typography, alignment |
| Errors | Error messages, recovery flows |
| Animation | Timing, easing, smoothness |

## Trust Signals Checklist

### 1. Instant Feedback (< 100ms)
- [ ] All buttons have hover/focus/active states
- [ ] Interactive elements respond immediately to clicks
- [ ] Optimistic updates where safe
- [ ] Focus rings visible on keyboard navigation

### 2. Intentional Loading
- [ ] Skeleton screens match actual content layout
- [ ] No empty containers or layout shifts during load
- [ ] Shimmer animations are smooth
- [ ] No orphaned spinners

### 3. State Continuity
- [ ] Page transitions don't pop or jump
- [ ] Scroll position preserved on navigation
- [ ] Modal/drawer transitions are smooth
- [ ] Form state persists through interruptions
- [ ] No flash of unstyled content (FOUC)

### 4. Visual Rhythm
- [ ] Spacing uses design tokens consistently
- [ ] Typography hierarchy is predictable
- [ ] Alignment is pixel-perfect
- [ ] Component sizing follows a clear system

### 5. Graceful Errors
- [ ] Error messages guide, not panic
- [ ] Clear next actions provided
- [ ] Layout remains stable during errors
- [ ] Appropriate severity (destructive vs warning)

### 6. Micro-Animations
- [ ] Transitions use consistent timing (150-300ms)
- [ ] Easing is ease-out for natural feel
- [ ] Accordion/collapse animations don't stutter
- [ ] Progress indicators move smoothly

## Review Output Format

```markdown
## UX Review: [Component/Page Name]

### Summary
[One-line overall assessment]

### Findings

| Status | Scope | Issue | Recommendation |
|--------|-------|-------|----------------|
| 🔴 | Feedback | No loading state on submit button | Add `disabled` + spinner during submission |
| ⚠️ | Rhythm | Inconsistent padding in cards | Use `p-4` consistently |
| ✅ | Animation | Smooth modal transitions | - |

### Priority Fixes
1. [Most critical issue]
2. [Second priority]
3. [Third priority]
```

## Reference Products

When reviewing, compare against:
- **Linear**: Every pixel considered, interactions feel inevitable
- **Revolut**: Security through polish, every animation signals control
- **Stripe Dashboard**: Complex data, serene presentation
- **Vercel**: Speed as a feature, instant feedback everywhere

## How to Use

1. Open the component/page to review
2. Load this skill: `use skill reviewing-ux`
3. Ask: "Review the UX of [component/file]"
4. Receive structured feedback with actionable fixes
