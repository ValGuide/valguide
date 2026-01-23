---
name: reviewing-ux
description: Reviews UI designs and implementations using the Status/Scope/Action model. Use when evaluating UX, reviewing component designs, or assessing user flows.
---

# UX Review Skill

Apply the Status/Scope/Action model and supporting UX principles to evaluate designs and implementations.

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

### Recommendations
- [Specific actionable improvements]
```

## Guiding Principle

> Good UX is not clever. It's calm.

If users feel confident, oriented, and unafraid — the system is working.
