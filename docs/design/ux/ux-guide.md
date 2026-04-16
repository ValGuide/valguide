---
title: "Core UX Principles & Best Practices"
---

This document consolidates a practical UX mental model, its supporting concepts, and applied best practices. It is designed to be reused for design reviews, onboarding, and product discussions.

---

## The Status / Scope / Action Model

A simple way to think about **what a UI is telling the user vs. what it lets them do**.

### 1. Status — “What’s happening right now?”

Anything that communicates the **current state** of the system.

**Key ideas**

* System status should always be visible
* Users shouldn’t have to guess

**Examples**

* Loading spinners, progress bars
* Online/offline indicators
* Success / error messages
* Disabled vs enabled buttons
* “Saved ✓” vs “Unsaved changes”

**Related concepts**

* Feedback
* Visibility of system status (Nielsen heuristic)
* Latency masking
* Empty states

---

### 2. Scope — “What am I looking at?”

Defines **where the user is** and **what’s included or excluded**.

**Examples**

* Page titles (“Billing Settings”)
* Breadcrumbs
* Tabs (Personal / Team / Org)
* Filters applied (“Showing: Last 30 days”)
* Selected items count

**Related concepts**

* Information architecture
* Context awareness
* Wayfinding
* Progressive disclosure

---

### 3. Action — “What can I do?”

Anything that lets the user **cause change**.

**Examples**

* Buttons, links, icons
* Primary vs secondary actions
* Keyboard shortcuts
* Swipe actions
* Bulk actions

**Related concepts**

* Affordances
* Signifiers
* Call to action (CTA)
* Action hierarchy

---

### 4. Feedback — “Did that work?”

What the system says **after** an action.

**Examples**

* Button press animation
* Toast notifications
* Inline validation errors
* Undo options
* Sound / haptic feedback (mobile)

**Rule of thumb**

> Every action deserves feedback — even tiny ones.

---

### 5. Constraints — “What can’t I do?”

Limits that prevent errors or confusion.

**Examples**

* Disabled buttons
* Input masks (date, phone)
* Character limits
* Grayed-out menu items
* Permission-based access

**Related concepts**

* Error prevention
* Guardrails
* Progressive enabling

---

### 6. Hierarchy — “What matters most?”

How importance is communicated visually and structurally.

**Examples**

* Size, color, contrast
* Primary vs secondary buttons
* Heading levels
* Visual grouping

**Design check**

> If you blur your eyes, do the right things still stand out?

---

## Quick Review Framework

When reviewing a design, ask:

1. Status — What’s happening?
2. Scope — Where am I?
3. Action — What can I do?
4. Feedback — What changed?
5. Constraints — What’s allowed?
6. Hierarchy — What’s important?

If one of these is unclear, users feel lost.

---

## Supporting UX Concepts (How the Model Works in Practice)

These concepts don’t replace **Status / Scope / Action** — they explain **why the model succeeds or fails**.

---

### Mapping — “Does this behave how users expect?”

**Purpose:** Align UI behavior with real-world mental models.

**Good mapping**

* Sliders move left → less, right → more
* Toggles visually reflect on/off
* Dragging moves objects

**Failure mode**

> Users understand the label but mistrust the behavior.

---

### Consistency — “Have I seen this before?”

**Purpose:** Reduce learning and build trust.

**Rules**

* Same action → same control → same outcome
* Terminology must not drift (“Delete” ≠ “Remove”)
* Patterns should repeat across screens with similar goals

**Note**

Consistency serves clarity, not visual sameness.

---

### Discoverability — “How would I even know this exists?”

**Purpose:** Make functionality visible without instruction.

**Techniques**

* Visible controls
* Empty states with guidance
* Progressive disclosure
* Inline hints (used sparingly)

**Failure mode**

> Features that only power users know exist.

---

### Cognitive Load — “How hard is this to think about?”

**Purpose:** Minimize mental effort per decision.

**Ways to reduce it**

* Chunk information
* Use sensible defaults
* Remove unnecessary choices
* Show only what’s relevant right now

**Rule**

> If users pause to think about the UI instead of the task, load is too high.

---

### Information Architecture — “Does this structure make sense?”

**Purpose:** Ensure content and actions are grouped logically.

**Signals**

* Clear grouping
* Predictable navigation
* Logical nesting

**Failure mode**

> Users know what they want but not where to find it.

---

### Progressive Disclosure — “Right info, right time”

**Purpose:** Avoid overwhelming users.

**Rules**

* Start simple
* Reveal complexity as intent increases
* Advanced options should feel opt-in

---

## How It Fits Together

* **Status / Scope / Action** = what the UI is doing
* **Supporting concepts** = why it feels usable or not

UX usually breaks because:

* Status is hidden
* Scope is ambiguous
* Actions are overloaded
* One or more supporting concepts are violated

---

## UX Best Practices (Product & Tooling)

### 1. One interaction = one responsibility

* Never combine context switching with structure management
* If something changes what you’re editing, it must not also change the system

**Example**

* ✅ Language switcher = switch only
* ❌ Language switcher = add / remove / status / danger actions

---

### 2. Destructive actions must have a clear home

* Destructive actions belong on overview or settings screens
* Editing screens should feel safe and reversible
* Hesitation before clicking often signals misplacement

---

### 3. Match screen power to screen scope

* Higher-level screens → configuration & management
* Lower-level screens → focus & execution
* Never give small screens big, irreversible powers

---

### 4. Avoid “Swiss-army” UI components

* Dropdowns, modals, and menus should not:

  * Switch state
  * Create entities
  * Destroy entities
  * Explain system status
    all at once

If copy over-explains, the component is doing too much.

---

### 5. Status ≠ action

* Showing status (“Draft”, “Missing”, “Complete”) is not acting on it
* Status should be passive, glanceable, and non-interruptive
* Actions should live elsewhere

---

### 6. Reduce fear in core workflows

Editing flows should feel:

* Safe
* Predictable
* Undo-friendly

If users worry “Will this break something?”, UX has failed.

---

### 7. Don’t make users manage the system while doing work

* While editing, users should think about content, not structure
* Management tasks should be opt-in, not ambient

---

### 8. Consistency is secondary to clarity

* Screens don’t need identical controls if goals differ
* Visual symmetry is less important than mental models

---

### 9. If a feature needs explanation, question the placement

* Tooltips and long confirmation copy often signal:

  * Wrong screen
  * Wrong component
  * Wrong timing

Prefer obvious structure over clever copy.

---

### 10. UX litmus test

Ask for every interaction:

* What mental mode is the user in right now?
* Does this action belong in that mode?

If the answer isn’t obvious, split the interaction.

---

## Final Reminder

> **Good UX is not clever. It’s calm.**

If users feel confident, oriented, and unafraid — the system is working.


## Related Guidelines

- [Notification & Feedback Guidelines](./ux-notifications.md) — Toasts, banners, inline status
- [Emotional Safety Guidelines](./ux-emotional-safety.md) — Reducing anxiety, building trust
- [UX Polish Principles](./ux-polish-principles.md) — Micro-details that build trust

