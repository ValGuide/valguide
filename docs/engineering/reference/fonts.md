---
title: "Font Loading Strategy"
---

ValGuide uses self-hosted variable fonts with a loading strategy optimized for zero layout shift (CLS) and no flash of unstyled text (FOUT).

There are now two layers:

1. always-on shell fonts for app chrome and base UI
2. selectively loaded theme fonts for the visitor tour experience

## Fonts

| Font | CSS Variable | Weight Range | Usage |
|------|-------------|-------------|-------|
| Noto Sans Variable | `--font-sans` | 100–900 | Primary UI font (all text) |
| Vollkorn Variable | `--font-serif` | 400–900 | Tour descriptions, rich content |
| JetBrains Mono Variable | `--font-mono` | 100–800 | Code blocks, monospace content |

## Architecture

```
packages/core/ui/styles/
├── fonts.css          ← @font-face declarations (font-display: optional)
└── globals.css        ← imports fonts.css, defines --font-sans/serif/mono

apps/{studio,admin,app,links,www}/
├── public/fonts/      ← self-hosted .woff2 files
│   ├── noto-sans-latin-wght-normal.woff2
│   ├── noto-sans-latin-ext-wght-normal.woff2
│   ├── vollkorn-latin-wght-normal.woff2
│   ├── vollkorn-latin-ext-wght-normal.woff2
│   ├── jetbrains-mono-latin-wght-normal.woff2
│   └── jetbrains-mono-latin-ext-wght-normal.woff2
├── public/fonts/theme/   ← per-font CSS chunks for visitor theme fonts
└── src/routes/__root.tsx  ← <link rel="preload"> for critical shell fonts
```

## How It Works

### 1. Self-Hosted Fonts

Font files are copied from `@fontsource-variable` packages into each app's `public/fonts/` directory. This gives us full control over `@font-face` declarations — specifically `font-display` — which fontsource hardcodes to `swap`.

Only **latin** and **latin-ext** unicode-range subsets are included. These cover all characters needed for our supported locales (en, de, rm). Other subsets (cyrillic, devanagari, greek, vietnamese) are excluded to reduce bundle size.

### 2. `font-display: optional` (Zero Layout Shift)

All `@font-face` declarations use `font-display: optional` instead of `swap`:

| Behavior | `swap` (old) | `optional` (current) |
|----------|-------------|---------------------|
| First visit (cold cache) | Shows fallback → swaps to custom font mid-render (FOUT) | Shows fallback for full page load, caches font for next visit |
| Repeat visits (warm cache) | Shows custom font | Shows custom font |
| Layout shift (CLS) | Yes — text reflows when font swaps | Zero — no swap ever occurs |
| Perceived quality | Jittery, unprofessional | Stable, polished |

With `optional`, the browser gives the font a very short block period (~100ms). If the font loads in time (from cache or preload), it's used. If not, the fallback is used for the entire page load — no swap ever happens.

### 3. Font Preloading

Each app's `__root.tsx` includes `<link rel="preload">` hints for the two critical fonts (Noto Sans and Vollkorn). These appear **before** the stylesheet link in the `<head>`:

```typescript
links: [
  {
    rel: 'preload',
    href: '/fonts/noto-sans-latin-wght-normal.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    href: '/fonts/vollkorn-latin-wght-normal.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  { rel: 'stylesheet', href: appCss },
]
```

Preloading starts the font download immediately when the HTML is parsed, rather than waiting for CSS to be parsed → CSSOM built → font URL discovered. This makes the font available within the `optional` block period even on first visit.

JetBrains Mono is **not preloaded** because it's only used in code blocks (not critical path).

### 4. Theme Fonts

Tour themes use a separate font registry in `packages/core/features/themes/fonts.ts`.

- themes store a stable font id plus resolved family/fallback data
- the public app adds stylesheet and preload links only for the selected tour font
- Studio lazy-loads the available preview catalog when the picker opens, then keeps loaded fonts warm for the session
- theme fonts use separate family names such as `Theme Noto Sans` so the visitor-theme pipeline stays independent from the always-on shell fonts

The MVP currently exposes one font selection per theme and applies it to the whole visitor experience.

### 5. Fallback Font Metric Overrides

A fallback `@font-face` called `Noto Sans Fallback` is defined with metric overrides that match Noto Sans's dimensions:

```css
@font-face {
  font-family: 'Noto Sans Fallback';
  src: local('Arial');
  size-adjust: 100.5%;
  ascent-override: 101%;
  descent-override: 27%;
  line-gap-override: 0%;
}
```

The `--font-sans` stack is: `'Noto Sans Variable', 'Noto Sans Fallback', sans-serif`. If the custom font isn't available (rare with preloading), the fallback Arial renders with nearly identical metrics — no visible text reflow.

## Adding a New Theme Font

1. Install the `@fontsource-variable` package in `packages/core`
2. Copy the relevant `.woff2` files (latin + latin-ext) to each app's `public/fonts/`
3. Add a dedicated CSS chunk in `public/fonts/theme/` with `font-display: optional`
4. Register the new family in `packages/core/features/themes/fonts.ts`
5. If it becomes part of the always-on shell font set, also add it to `packages/core/ui/styles/fonts.css`
6. Optionally add a fallback `@font-face` with metric overrides

## Updating Fonts

When upgrading `@fontsource-variable` packages, re-copy the `.woff2` files from `node_modules` to all app `public/fonts/` directories:

```bash
CORE_MODULES="packages/core/node_modules/@fontsource-variable"
for app in studio admin app links www; do
  cp $CORE_MODULES/noto-sans/files/noto-sans-latin-wght-normal.woff2 apps/$app/public/fonts/
  cp $CORE_MODULES/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2 apps/$app/public/fonts/
  cp $CORE_MODULES/vollkorn/files/vollkorn-latin-wght-normal.woff2 apps/$app/public/fonts/
  cp $CORE_MODULES/vollkorn/files/vollkorn-latin-ext-wght-normal.woff2 apps/$app/public/fonts/
  cp $CORE_MODULES/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2 apps/$app/public/fonts/
  cp $CORE_MODULES/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2 apps/$app/public/fonts/
done
```

## Storybook

Storybook imports `globals.css` in `apps/storybook/.storybook/preview.tsx`, so it uses the same self-hosted `/fonts/...` URLs as the apps. The font files are available under `apps/storybook/public/fonts/`, and Storybook also mounts that shared font path in `apps/storybook/.storybook/main.tsx`.
