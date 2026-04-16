---
title: "View Transitions"
---

Smooth page transitions using the CSS View Transitions API with TanStack Router.

## Configuration

### Router Setup

In `apps/studio/src/router.tsx`:

```typescript
const router = createRouter({
  // ... other options
  
  // Show pending component immediately (0ms delay) to prevent layout shifts
  defaultPendingMs: 0,
  
  // Minimum time to show pending component to prevent flash (200ms feels instant but smooth)
  defaultPendingMinMs: 200,
  
  // Enable view transitions for smooth page changes (Chrome 111+)
  defaultViewTransition: true,
})
```

### CSS Setup

In `packages/core/ui/styles/globals.css`:

```css
/* Stable elements excluded from view transitions */
[data-slot="sidebar"],
[data-slot="sidebar-wrapper"],
[data-slot="sidebar-container"],
[data-slot="sidebar-inner"],
[data-slot="sidebar-gap"],
[data-slot="sidebar-trigger"],
[data-slot="sidebar-rail"] {
    view-transition-name: none;
}

/* Main content area participates in view transitions */
[data-slot="sidebar-inset"] {
    view-transition-name: main-content;
}

/* Crossfade animation for main content only */
::view-transition-old(main-content) {
    animation: fade-out 150ms ease-out both;
}

::view-transition-new(main-content) {
    animation: fade-in 150ms ease-out both;
}

/* Disable the default root transition */
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
}
```

## How It Works

1. **`defaultPendingMs: 0`** - Shows the `pendingComponent` (skeleton) immediately when navigating, instead of waiting 1 second (the default). This prevents visible layout shifts.

2. **`defaultPendingMinMs: 200`** - If the skeleton shows, it stays visible for at least 200ms. This prevents a jarring flash if data loads very quickly.

3. **`defaultViewTransition: true`** - Uses the browser's View Transitions API to crossfade between pages. Falls back gracefully on unsupported browsers.

4. **Scoped transitions** - The sidebar and stable layout elements are excluded from the transition using `view-transition-name: none`. Only the main content area (`sidebar-inset`) animates, preventing sidebar flicker.

## Why Scoped Transitions?

By default, view transitions apply to the entire `root` element, which causes all elements (including sidebar, header) to fade. This creates visual instability for stable layout elements that shouldn't change between navigations.

The solution:
- **Exclude stable elements**: `view-transition-name: none` removes them from the transition entirely
- **Target content area**: `view-transition-name: main-content` gives the content area its own transition group
- **Custom animation**: `::view-transition-old/new(main-content)` animates only the content

## Browser Support

- **Chrome 111+**: Full support with smooth crossfade
- **Safari 18+**: Full support
- **Firefox**: No support yet (falls back to instant swap)
- **Reduced motion**: Animations disabled automatically

## Timing Guidelines

| Duration | Use Case |
|----------|----------|
| 150ms | Page transitions, crossfades |
| 200ms | Minimum skeleton display time |
| 300ms | Modal/drawer open/close |

## References

- [TanStack Router - View Transitions](https://tanstack.com/router/latest/docs/framework/react/api/router/RouterOptionsType#defaultviewtransition-property)
- [MDN - View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [MDN - view-transition-name](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name)
- [Chrome - Same-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)
