---
title: "Notification & Feedback Guidelines"
---

How to communicate system status, confirmations, and errors to users.

---

## Core Principle

> **Use the least interruptive pattern that still prevents confusion.**

Notifications should build confidence, not create anxiety. For our audience of museum professionals with low-mid tech levels, persistent visibility beats ephemeral popups.

---

## The Notification Ladder

Choose the appropriate level based on context:

| Level | Pattern | Visibility | Use When |
|-------|---------|------------|----------|
| 1 | **Inline status** | Persistent | "Did it save?" / "Is this complete?" |
| 2 | **Inline message** | Persistent until resolved | Error tied to specific component |
| 3 | **Toast/Snackbar** | Ephemeral (3-10s) | Undo actions, background completions |
| 4 | **Banner** | Persistent until dismissed | Page-level issues affecting workflow |
| 5 | **Dialog** | Blocking | Irreversible/destructive actions |

**Rule**: Start at Level 1. Only escalate when the lower level is insufficient.

---

## Level 1: Inline Status

For continuous state communication. Users should never wonder "did it work?"

### Save State Indicator

Always visible in editor headers:

```
┌─────────────────────────────────────┐
│ ⟳ Saving...                         │  ← Spinner, muted text
│ ✓ Saved 2 minutes ago               │  ← Checkmark, muted text
│ ⚠ Not saved                         │  ← Warning icon, retry link
│ ○ Offline                           │  ← Neutral, explanatory
└─────────────────────────────────────┘
```

### Publish State

Status chips that update immediately on action:

- `Draft` → `Published` (animate transition)
- Show timestamp: "Published 5 min ago"

### Completeness Badges

Per-locale or per-field status:

- ✓ Complete (green)
- ⚠ Needs Update (amber) — source changed since translation
- ○ Missing (neutral)

---

## Level 2: Inline Messages

For errors and guidance tied to specific components.

### When to Use

- Upload failures (show near the uploader)
- Validation errors (show near the field)
- Permission issues (show near the blocked action)

### Format

```
┌─────────────────────────────────────────────────┐
│ ⚠ Upload failed: File too large (max 50MB)     │
│   [Try again] [Choose different file]          │
└─────────────────────────────────────────────────┘
```

### Guidelines

- Show **what happened** + **what to do next**
- Include retry/fix actions inline
- Persist until resolved or dismissed
- Don't duplicate as a toast

---

## Level 3: Toasts/Snackbars

For ephemeral confirmations that don't need persistent visibility.

### When to Use ✅

| Scenario | Example |
|----------|---------|
| Destructive action with Undo | "Asset deleted — [Undo]" |
| Background process completed | "Upload complete" |
| Action affecting other screens | "Invitation sent" |
| One-off confirmation | "Link copied" |

### When NOT to Use ❌

| Scenario | Better Alternative |
|----------|-------------------|
| Routine saves | Inline save indicator |
| Field validation | Inline error near field |
| Publish/unpublish | Status chip update |
| Reorder/move | Visual feedback from drag |
| Settings changes | Inline confirmation |

### Configuration

| Type | Duration | Dismissible | Actions |
|------|----------|-------------|---------|
| Success (no action) | 3-4 seconds | Yes | None |
| Success with Undo | 8-10 seconds | Yes | Undo button |
| Error | Until dismissed | Yes (X button) | Retry, Details |
| Info | 5 seconds | Yes | Optional link |

### Position

- **Bottom-right** preferred (doesn't cover header controls)
- Ensure it doesn't overlap primary action buttons
- Stack multiple toasts vertically

### Content Guidelines

**Do:**
- Keep text short (1 line ideal, 2 max)
- Use sentence case
- Include action verb: "Deleted", "Sent", "Saved"
- Add Undo for reversible destructive actions

**Don't:**
- Don't start with "Successfully" (redundant)
- Don't use technical jargon
- Don't show for every small action
- Don't rely on color alone for meaning

### Examples

```
✅ Good:
"Asset deleted" [Undo]
"Invitation sent to maria@museum.org"
"3 stops published"

❌ Bad:
"Operation completed successfully"
"Failed to update tour assets" (no next step)
"Saved" (use inline indicator instead)
```

---

## Level 4: Banners

For page-level issues that affect the user's ability to work.

### When to Use

- Offline status
- Session expiring
- System maintenance
- Blocking validation errors before publish
- Out-of-date translations notification

### Format

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ You're offline. Changes will sync when reconnected.  [×] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ℹ 2 translations are out of date. [Review changes]     [×] │
└─────────────────────────────────────────────────────────────┘
```

### Guidelines

- Place at top of content area (below header)
- Persist until issue resolved or dismissed
- Include action to resolve if possible
- Use appropriate severity colors (warning, info, error)

---

## Level 5: Dialogs

For high-stakes, irreversible actions requiring explicit confirmation.

### When to Use

- Publish (making content public)
- Unpublish (removing from public)
- Delete (permanent removal)
- Discard changes (losing work)
- Archive (changing visibility)

### Guidelines

- Explain consequences clearly
- Show what will happen, not just "Are you sure?"
- Primary action should match the intent (e.g., "Publish" not "OK")
- Offer escape route ("Cancel", "Keep editing")
- For publish: show readiness checklist

### Example

```
┌─────────────────────────────────────────────────────────────┐
│ Publish this translation?                                   │
│                                                             │
│ This will make the German version visible to visitors.      │
│ You can unpublish anytime.                                  │
│                                                             │
│                              [Cancel]  [Publish]            │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Message Guidelines

Errors should reduce anxiety, not increase it.

### Structure

1. **What happened** (brief, non-technical)
2. **Why it matters** (optional, if not obvious)
3. **What to do next** (actionable)

### Examples

```
❌ Bad:
"Error: Failed to update tour assets"
"Something went wrong"
"Request failed with status 500"

✅ Good:
"Couldn't save your changes. Check your connection and try again."
"This file is too large. Choose a file under 50MB."
"We couldn't reach the server. Your changes are saved locally and will sync automatically."
```

### Tone

- Calm, not alarming
- Helpful, not blaming
- Specific, not vague
- Action-oriented

---

## Accessibility Requirements

### ARIA Live Regions

- Success messages: `aria-live="polite"`
- Error messages: `aria-live="assertive"` (use sparingly)
- Don't announce every save — batch autosave into status region

### Keyboard

- Toasts dismissible with Escape
- Focus management: don't steal focus from user's work
- Action buttons in toasts must be keyboard accessible

### Motion

- Respect `prefers-reduced-motion`
- Avoid jarring animations
- Subtle slide-in preferred over bounce/shake

### Color

- Never rely on color alone
- Always include icon or text indicator
- Meet WCAG contrast ratios

---

## Undo-First Design

For destructive actions that can be reversed, prefer Undo over confirmation dialogs.

### Pattern

1. Execute action immediately (optimistic UI)
2. Show snackbar with Undo (8-10 seconds)
3. If no undo, commit permanently
4. If undo clicked, restore state

### Benefits

- Faster workflow (no confirmation dialog)
- Reduces anxiety (easy to reverse)
- Encourages exploration

### Applicable Actions

- Delete asset
- Remove stop from tour
- Discard draft
- Remove team member

---

## Summary: Decision Tree

```
Is this about ongoing state (saved, published, complete)?
  → Use inline status indicator

Is this an error tied to a specific component?
  → Use inline message near that component

Is this a destructive action that can be undone?
  → Use toast with Undo action

Is this a background process completing?
  → Use toast (brief, no action needed)

Is this a page-level issue affecting workflow?
  → Use banner

Is this an irreversible, high-stakes action?
  → Use confirmation dialog
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Toast for every save | Noise, anxiety | Inline save indicator |
| Generic "Error occurred" | Not actionable | Specific message + next step |
| Error toast + inline error | Duplication | Pick one (prefer inline) |
| Success toast without Undo | Missed opportunity | Add Undo for destructive |
| Blocking dialog for minor actions | Friction | Use toast or nothing |
| Color-only status | Inaccessible | Add icon + text |

---

## References

- [Toast Inventory](../toasts.md)
- [UX Guide](./ux-guide.md)
- [Emotional Safety Guidelines](./ux-emotional-safety.md)
