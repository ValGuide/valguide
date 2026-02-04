---
name: polishing-ux
description: Polishes UI implementations by fixing micro-details, animations, loading states, and trust signals. Use when asked to "polish the UX" or improve UI feel.
---

# Polishing UX

Actively improves UI implementations by fixing micro-details that build user trust.

## Core Principle

**Polish isn't vanity—it's how users judge the entire system.** Users unconsciously equate frontend smoothness with backend reliability.

**Reference Documentation** (read before polishing):
- `docs/ux/ux-guide.md` — Status/Scope/Action model and UX best practices
- `docs/ux/ux-polish-principles.md` — Trust signals and micro-details checklist
- `docs/ux/ux-emotional-safety.md` — Emotionally safe design for risk-averse users

## Workflow

1. **Read** the component/page code
2. **Identify** missing trust signals using the checklist below
3. **Fix** issues in priority order (Critical → Minor)
4. **Verify** skeleton components match updated layouts
5. **Test** loading states, error states, and transitions

## What to Fix

### 1. Instant Feedback (< 100ms)
- Add hover/focus/active states to all interactive elements
- Add `disabled` state with spinner during async operations
- Ensure focus rings are visible on keyboard navigation
- Use optimistic updates where safe

### 2. Loading States
- Replace empty containers with skeleton screens
- Ensure skeletons match actual content layout exactly
- Add shimmer animations (`animate-pulse`)
- Remove orphaned spinners

### 3. State Continuity
- Add transitions to page/route changes
- Preserve scroll position on navigation
- Smooth modal/drawer open/close (150-300ms ease-out)
- Prevent layout shifts (reserve space for dynamic content)

### 4. Visual Rhythm
- Use design tokens for spacing (never arbitrary values)
- Ensure consistent padding/margins
- Fix alignment issues
- Check typography hierarchy

### 5. Error States
- Ensure error messages guide, not panic
- Maintain layout stability during errors
- Use appropriate severity (destructive vs warning)
- Provide clear recovery actions

### 6. Micro-Animations
- Add consistent timing (150-300ms ease-out)
- Smooth accordion/collapse animations
- Add hover transitions to cards/buttons
- Ensure progress indicators animate smoothly

## Common Fixes

```tsx
// ❌ No loading state
<Button onClick={handleSubmit}>Save</Button>

// ✅ With loading state
<Button onClick={handleSubmit} disabled={isPending}>
  {isPending ? <Spinner className="size-4" /> : null}
  Save
</Button>
```

```tsx
// ❌ No hover transition
<div className="bg-muted">

// ✅ Smooth hover
<div className="bg-muted transition-colors hover:bg-muted/80">
```

```tsx
// ❌ Layout shift on load
{data && <Content data={data} />}

// ✅ Skeleton prevents shift
{data ? <Content data={data} /> : <ContentSkeleton />}
```

```tsx
// ❌ Abrupt modal
<Dialog>

// ✅ Smooth modal (shadcn/ui default, but verify)
<Dialog> // Uses built-in animations
```

## Skeleton Update Rule

**CRITICAL**: When modifying component structure/layout, ALWAYS update the corresponding skeleton:
- `component.tsx` → `component-skeleton.tsx`
- Skeleton must match exact dimensions and spacing

## Priority Order

1. **Critical**: Missing loading states, layout shifts, broken interactions
2. **Important**: Missing hover states, inconsistent spacing
3. **Minor**: Animation timing, subtle transitions

## How to Use

1. User says: "Polish the UX of [component/feature]"
2. Load this skill
3. Read the component code
4. Apply fixes in priority order
5. Update skeleton if layout changed
6. Summarize changes made
