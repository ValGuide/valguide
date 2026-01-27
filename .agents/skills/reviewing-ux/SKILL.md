---
name: reviewing-ux
description: Reviews UI designs and implementations using the Status/Scope/Action model. Use when evaluating UX, reviewing component designs, or assessing user flows.
resources:
  - docs/ux/ux-guide.md
  - docs/ux/ux-emotional-safety.md
---

# UX Review Skill

Apply the Status/Scope/Action model, supporting UX principles, and ValGuide's emotional safety guidelines to evaluate designs and implementations.

**Reference documents:**
- [UX Guide](docs/ux/ux-guide.md) — Status/Scope/Action model and best practices
- [Emotional Safety Guidelines](docs/ux/ux-emotional-safety.md) — ValGuide-specific principles for safe, calm, trustworthy UI

## Quick Review Framework

For every UI element or flow, ask:

1. **Status** — What's happening? (loading, saved, error, online/offline)
2. **Scope** — Where am I? (page title, breadcrumbs, filters, selection)
3. **Action** — What can I do? (buttons, links, shortcuts)
4. **Feedback** — What changed? (toasts, animations, validation)
5. **Constraints** — What's allowed? (disabled states, limits, permissions)
6. **Hierarchy** — What's important? (size, color, contrast, grouping)

If any is unclear, users feel lost.

## Supporting Concepts

Check these when the model feels broken:

- **Mapping** — Does behavior match expectations? (slider left = less)
- **Consistency** — Same action → same control → same outcome
- **Discoverability** — Would users know this exists without instruction?
- **Cognitive Load** — Are users thinking about UI instead of task?
- **Information Architecture** — Logical grouping and navigation?
- **Progressive Disclosure** — Right info at right time?

## Best Practices Checklist

### Interaction Design
- [ ] One interaction = one responsibility
- [ ] Destructive actions on overview/settings screens, not edit screens
- [ ] Match screen power to screen scope (small screens ≠ big powers)
- [ ] No "Swiss-army" components (dropdown doing switch + create + destroy)

### Status vs Action
- [ ] Status is passive and glanceable ("Draft", "Missing")
- [ ] Actions live separately from status display

### User Confidence
- [ ] Editing flows feel safe and reversible
- [ ] Users think about content, not system management
- [ ] No fear of "Will this break something?"

### Clarity Over Consistency
- [ ] Screens match goals, not forced visual symmetry
- [ ] If feature needs explanation, question the placement
- [ ] Obvious structure > clever copy

## Emotional Safety Checklist (ValGuide-Specific)

### Core Principles
- [ ] **Clarity over cleverness** — Plain language, predictable navigation, obvious next steps
- [ ] **User control** — Undo, back, cancel, draft states available; consequences explained before committing
- [ ] **Non-judgmental microcopy** — No "invalid/failed/incorrect" without explanation; never imply user fault
- [ ] **Gentle error handling** — Inline validation, preserve user input, clear recovery path
- [ ] **Transparency** — Pricing/limits/permissions visible just-in-time; no hidden behavior

### Reduce Overwhelm
- [ ] Progressive disclosure instead of showing everything
- [ ] Sensible defaults and templates
- [ ] Onboarding can be skipped or revisited
- [ ] No aggressive modals or alert storms

### ValGuide-Specific
- [ ] **Private by default** — Creation starts in draft; publishing is deliberate and explained
- [ ] **Visibility indicator** — Clear where content is visible (draft / team / visitors)
- [ ] **AI as collaborator** — AI content labeled, defaults to draft, easy to reject/modify

### High-Impact Touchpoints (Extra Care Required)
- Onboarding and first-run experience
- Empty states and first success moments
- Publishing and unpublishing flows
- Billing, upgrades, downgrades, cancellation
- Data deletion and workspace removal
- Permissions, invites, role changes
- Import/export and migration flows
- Error states (auth, payments, integrations, rate limits)

## Litmus Test

For every interaction ask:
1. What mental mode is the user in?
2. Does this action belong in that mode?

If unclear → split the interaction.

## Review Output Format

When reviewing, structure feedback as:

```
## UX Review: [Component/Flow Name]

### Status/Scope/Action Analysis
- Status: [findings]
- Scope: [findings]
- Action: [findings]
- Feedback: [findings]
- Constraints: [findings]
- Hierarchy: [findings]

### Issues Found
1. [Issue]: [Why it violates principle] → [Recommendation]

### Emotional Safety Assessment
- User control: [findings]
- Error handling: [findings]
- Transparency: [findings]
- Private by default: [findings]

### Recommendations
- [Specific actionable improvements]
```

## Guiding Principles

> Good UX is not clever. It's calm.

> Would a careful, slightly anxious user feel safe doing this?

If the answer is not a clear yes, the design needs adjustment.
