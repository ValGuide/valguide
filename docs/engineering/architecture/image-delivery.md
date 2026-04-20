---
title: "Image Delivery"
---

> How ValGuide stores, transforms, and delivers images to visitors and curators.

## System Overview

ValGuide stores all media (images, audio, video) in **Cloudflare R2**. Images are transformed on the fly — resized, format-converted, and quality-optimized — before reaching the browser. Audio and video are served directly from R2 without transformation.

The active image delivery provider is controlled by `VITE_IMAGE_DELIVERY_PROVIDER` when set, with fallback to the legacy `VITE_IMAGE_PROVIDER`. Supported providers are `cloudflare`, `imagekit`, and `origin`.

The schema-level fallback default remains `cloudflare` until deployment envs are switched explicitly.

### Cloudflare mode (`VITE_IMAGE_DELIVERY_PROVIDER=cloudflare`)

```
┌─────────────┐     ┌──────────────────────┐     ┌───────────────┐     ┌─────────┐
│   R2 Bucket │────▶│  Image Guard Worker  │────▶│  Edge Cache   │────▶│ Browser │
│  (originals)│     │  /i/w-640/path.jpg   │     │  (Cloudflare) │     │  + SW   │
└─────────────┘     └──────────────────────┘     └───────────────┘     └─────────┘
                              │
                    fetch(origin, {
                      cf: { image: {
                        width, quality,
                        format, fit
                      }}
                    })
```

### ImageKit mode (`VITE_IMAGE_DELIVERY_PROVIDER=imagekit`)

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────┐
│   R2 Bucket │────▶│  ImageKit CDN        │────▶│ Browser │
│  (originals)│     │  (transforms + CDN)  │     │  + SW   │
└─────────────┘     └──────────────────────┘     └─────────┘
```

## Architecture Layers

| Layer | What it does | Details |
|-------|-------------|---------|
| **R2** | Stores original uploaded files | EU jurisdiction, `$0` egress via Cloudflare CDN |
| **Image Guard Worker** | Validates transform params, fetches origin with `cf.image` options | Runs at `assets.valguide.com/i/*` |
| **Cloudflare Edge** | Performs the actual resize/encode as part of the Worker's `fetch()` call | Caches each unique (source + params) combo |
| **Browser + Service Worker** | Caches transformed images locally | `Cache-Control: public, max-age=31536000, immutable` |

## Request Flow

### 1. `<Image>` component generates `/i/` URLs

The custom `<Image>` component (wrapping `@unpic/react`) uses a transformer that converts source URLs into `/i/` URLs with transform params:

```
Source:  https://assets.valguide.com/orgs/abc/cover.jpg
srcset:  https://assets.valguide.com/i/w-320/orgs/abc/cover.jpg 320w,
         https://assets.valguide.com/i/w-640/orgs/abc/cover.jpg 640w,
         https://assets.valguide.com/i/w-960/orgs/abc/cover.jpg 960w,
         ...
```

### 2. Worker validates and transforms

The Image Guard Worker at `/i/*`:

1. **Parses** the URL: `/i/w-640,q-80/orgs/abc/cover.jpg`
2. **Snaps** width to the nearest allowed value: `320, 640, 960, 1280, 1920` (e.g., `w-999` → `960`)
3. **Clamps** quality to max `85` (default `75`)
4. **Negotiates format** from the browser's `Accept` header (AVIF → WebP → JPEG)
5. **Ignores** unknown transform keys silently (forward-compatible)
6. **Fetches** the original from R2 with `cf.image` options:

```typescript
fetch('https://assets.valguide.com/orgs/abc/cover.jpg', {
  cf: {
    image: {
      width: 640,
      quality: 75,
      format: 'webp', // negotiated from Accept header
      fit: 'cover',
    },
  },
})
```

Cloudflare's edge performs the resize/encode as part of this `fetch()` call. The Worker never handles image bytes — it only validates and forwards.

### 3. Caching (three layers)

| Layer | Behavior | TTL |
|-------|----------|-----|
| **Cloudflare Edge** | Caches each unique (source + params) combo globally | Follows origin `Cache-Control` (min 1 hour) |
| **Service Worker** | `mediaCacheFirst` strategy for `assets.valguide.com` | Until SW update |
| **Browser** | `Cache-Control: immutable` — no revalidation during max-age | 1 year |

On repeat requests, the browser serves from local cache without any network call.

## URL Format

```
https://assets.valguide.com/i/{transforms}/{storagePath}
```

### Transform params

| Param | Required | Example | Description |
|-------|----------|---------|-------------|
| `w-{n}` | No | `w-640` | Width in pixels. Snapped to nearest allowed: `320, 640, 960, 1280, 1920`. Defaults to `1920` if missing. |
| `h-{n}` | No | `h-400` | Height in pixels |
| `q-{n}` | No | `q-80` | Quality 1–85 (default: 75) |

Multiple params are comma-separated: `/i/w-640,q-80/path.jpg`

### Fallback behavior

The Worker never returns `400` errors for transform issues — it uses sensible fallbacks instead:

| Scenario | Fallback |
|----------|----------|
| Width not in whitelist (`w-999`) | Snapped to nearest allowed width (`960`) |
| Missing width (`/i/q-80/path`) | Defaults to `1920` (largest breakpoint) |
| Unknown transform key (`x-1`) | Silently ignored |
| Invalid value (`w-abc`, `w-0`) | Param ignored; width falls back to `1920` |
| Missing storage path | `404` (genuinely broken URL) |

### Always enforced (not configurable via URL)

| Option | Value | Why |
|--------|-------|-----|
| `format` | Auto-negotiated (AVIF > WebP > JPEG) | Optimal format per browser |
| `fit` | `cover` | Fill the area, crop if needed |

### Examples

```
/i/w-320/orgs/abc/cover.jpg          → 320px wide, q75, auto format
/i/w-1920/orgs/abc/cover.jpg         → 1920px wide, q75, auto format
/i/w-640,q-80/orgs/abc/cover.jpg     → 640px wide, q80, auto format
/i/w-640,h-400/orgs/abc/cover.jpg    → 640×400, q75, auto format
```

## Width Whitelist

All requested widths are snapped to the nearest of 5 allowed values: **320, 640, 960, 1280, 1920**

The Worker never rejects invalid widths — instead it snaps `w-999` to `960`, `w-50` to `320`, etc. This ensures bots and crawlers always get a valid image while still capping unique transformations to 5 per source image.

This exists for three reasons:

1. **Cost control** — Cloudflare bills per unique (source + params) transformation per month ($0.50/1,000). With 5 widths, 1,000 images = 5,000 unique transformations (within free tier). Without restriction, a bot could generate thousands of billable variants.

2. **Cache efficiency** — Fewer variants means higher cache hit rates at the edge. 5 widths cover all standard responsive breakpoints.

3. **Predictability** — Monthly cost scales linearly with image count: `images × 5 = unique transformations`.

## Code Locations

| Component | File |
|-----------|------|
| `<Image>` component + transformer | `packages/core/ui/components/image.tsx` |
| Image delivery provider contract | `packages/core/features/assets/image-delivery.ts` |
| URL helpers (`getAssetImageUrl`, etc.) | `packages/core/features/assets/image-url.ts` |
| Image Guard Worker | `workers/image-guard/src/index.ts` |
| Worker config | `workers/image-guard/wrangler.jsonc` |
| Service worker caching | `apps/app/public/sw.js` |
| Asset base URL env vars | `VITE_ASSET_BASE_URL` with fallback to `VITE_R2_PUBLIC_URL` in `packages/core/env/schema.ts` |

## Using the `<Image>` Component

The custom `Image` component provides automatic responsive images, lazy loading, and content layout shift prevention.

```typescript
// In apps (studio, app, admin):
import { Image } from '@valguide/ui/components/image'

// In packages/core:
import { Image } from '@valguide/core/ui/components/image'
```

### Layout Modes

| Mode | When to Use | Example |
|------|-------------|---------|
| `layout="fullWidth"` | Image fills its container width (most common) | Cover images, cards, thumbnails |
| `layout="constrained"` | Image has a max size but can shrink | Fullscreen image viewer |

For component patterns, code examples, and usage conventions, see [Image Handling](../reference/images.md).

## Pricing

We use **Cloudflare Image Transformations** (not the Cloudflare Images storage product).

| Tier | Included | Overage |
|------|----------|---------|
| Free | 5,000 unique transformations/month | New transforms return error; cached ones keep working |
| Paid | 5,000 included | +$0.50 per 1,000/month |

A "unique transformation" = unique (source image + params) combo, billed **once per calendar month**. Repeat requests serve from cache at no cost. There are no delivery fees.

| Image count | × 5 widths | Monthly cost (Paid) |
|-------------|-----------|-------------------|
| 500 | 2,500 | $0 |
| 1,000 | 5,000 | $0 |
| 2,000 | 10,000 | $2.50 |
| 5,000 | 25,000 | $10.00 |

## Related

- [Image Handling](../reference/images.md) — `<Image>` component patterns, URL helpers, fallbacks, usage inventory, and coding conventions
