---
title: "Image Handling"
---

> For the full system architecture (R2 → Worker Guard → edge caching → browser), see [Image Delivery Architecture](../architecture/image-delivery.md).

## Image Delivery Provider

The active image delivery provider is controlled by `VITE_IMAGE_DELIVERY_PROVIDER` when set, with fallback to the legacy `VITE_IMAGE_PROVIDER` env var:

| Value | Behavior |
|-------|----------|
| `imagekit` | Images served via ImageKit CDN (`ik.imagekit.io/valguide/...`) |
| `cloudflare` (legacy fallback default) | Images served via Image Guard Worker (`/i/w-640/...`) with Cloudflare edge transforms |
| `origin` | Images served directly from the asset origin with no transform layer |

Switching providers requires only an env var change + redeploy. The `origin` provider exists as a portability fallback for environments without Cloudflare or ImageKit.

## `<Image>` Component

The custom `Image` component provides automatic responsive images, lazy loading, and content layout shift prevention. It wraps `@unpic/react/base` and selects a transformer through the shared image delivery provider contract:

- **Cloudflare mode**: Custom transformer generating `/i/` URLs for the Image Guard Worker. Breakpoints are restricted to `320, 640, 960, 1280, 1920` to match the Worker's allowed widths.
- **ImageKit mode**: Uses `unpic/providers/imagekit` transformer.
- **Origin mode**: Uses the direct asset origin without transform URLs.

```typescript
// In apps (studio, app, admin):
import { Image } from '@valguide/ui/components/image'

// In packages/core:
import { Image } from '@valguide/core/ui/components/image'
```

### Layout Modes

| Mode | When to Use | Example |
|------|-------------|---------|
| `layout="fullWidth"` | Image fills its container width (most common) | Cover images, cards, thumbnails, galleries |
| `layout="constrained"` | Image has a max size but can shrink | Fullscreen image viewer with `width`/`height` |

### Common Patterns

**Cover image in a fixed-height container:**
```tsx
<div className="relative h-44 w-full overflow-hidden">
  <Image
    src={imageUrl}
    alt={title}
    layout="fullWidth"
    className="h-full w-full object-cover"
  />
</div>
```

**Thumbnail in a square container:**
```tsx
<div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
  <Image
    src={imageUrl}
    alt={title}
    layout="fullWidth"
    className="w-full h-full object-cover"
  />
</div>
```

**Constrained image (e.g., zoomable viewer):**
```tsx
<Image
  src={src}
  alt={alt}
  layout="constrained"
  width={1200}
  height={1200}
  className="max-w-full max-h-full object-contain select-none pointer-events-none"
/>
```

**Image with `object-contain` (gallery, preserving aspect ratio):**
```tsx
<div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-muted">
  <Image
    src={imageUrl}
    alt={fileName}
    layout="fullWidth"
    className="absolute inset-0 w-full h-full object-contain"
  />
</div>
```

## Fallback / Empty State

Always provide a fallback when an image may be missing. Use a relevant Lucide icon inside a styled container:

```tsx
import { ImageIcon, Music } from 'lucide-react'

{imageUrl ? (
  <Image src={imageUrl} alt={title} layout="fullWidth" className="h-full w-full object-cover" />
) : (
  <div className="flex h-full w-full items-center justify-center bg-muted/30">
    <ImageIcon className="h-7 w-7 text-muted-foreground" />
  </div>
)}
```

Common fallback icons by context:
- **Tour/stop cover**: `ImageIcon` from `lucide-react`
- **Audio content**: `Music` from `lucide-react`
- **Video content**: `Video` from `lucide-react`

## URL Helpers

All image URL construction goes through `@valguide/core/features/assets/image-url`:

| Function | Use Case | Output |
|----------|----------|--------|
| `getAssetUrl(storagePath)` | Direct asset URL (audio/video, or image source for `<Image>`) | `${VITE_ASSET_BASE_URL || VITE_R2_PUBLIC_URL}/${path}` |
| `getImageKitUrl(storagePath)` | ImageKit-optimized URL (used internally when provider is `imagekit`) | `${VITE_IMAGEKIT_URL}/${path}` |
| `getAssetImageUrl(asset)` | Optimized image URL for `<Image>` component (provider-aware) | Cloudflare → direct asset URL transformed to `/i/...`, ImageKit → ImageKit URL, Origin → direct asset URL |
| `getAssetDisplayUrl(asset)` | Auto-selects by asset type | Images → `getAssetImageUrl`, audio/video → direct asset origin |
| `getAssetVideoThumbnailUrl(storagePath, options)` | Provider-managed video thumbnail URL when supported | Cloudflare → `/v/...`, ImageKit/Origin → `null` |

```typescript
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'

const url = getAssetImageUrl({ storagePath: 'orgs/abc/cover.jpg' })
// → https://assets.valguide.com/orgs/abc/cover.jpg
// The <Image> component transforms this to:
// → https://assets.valguide.com/i/w-640/orgs/abc/cover.jpg (in srcset)
```

## Dependencies

The image component lives in `@valguide/core` and wraps:

| Package | Purpose |
|---------|---------|
| `@unpic/react` (`^1.0.2`) | Base `<Image>` component with responsive rendering (uses `@unpic/react/base`) |
| `unpic` | ImageKit transformer (`unpic/providers/imagekit`) — used when `VITE_IMAGE_DELIVERY_PROVIDER=imagekit` |

The Cloudflare transformer is a custom function in `image.tsx` — no additional dependency needed.

Apps do **not** need `@unpic/react` or `unpic` as direct dependencies — they import the pre-configured component from `@valguide/ui/components/image`.

## Usage Inventory

### `packages/core/` (5 files)

| File | Context | Layout |
|------|---------|--------|
| `features/tours/preview-card.tsx` | Tour card cover image | `fullWidth` |
| `features/player/components/cover-image.tsx` | Player cover art | `fullWidth` |
| `features/player/components/fullscreen-image.tsx` | Zoomable fullscreen viewer | `constrained` |
| `features/player/components/mini-player.tsx` | Mini player thumbnail | `fullWidth` |
| `features/player/components/stops-list-item.tsx` | Stop list thumbnail | `fullWidth` |

### `apps/app/` (2 files)

| File | Context | Layout |
|------|---------|--------|
| `src/components/tours/tour-hero.tsx` | Tour hero banner | `fullWidth` |
| `src/components/tours/image-gallery.tsx` | Gallery main image + thumbnails | `fullWidth` |

### `apps/studio/` (5 files)

| File | Context | Layout |
|------|---------|--------|
| `src/features/assets/components/asset-card.tsx` | Asset grid card | `fullWidth` |
| `src/features/assets/components/asset-picker-modal.tsx` | Asset picker thumbnail | `fullWidth` |
| `src/features/assets/components/media-picker/media-picker-preview.tsx` | Selected media preview | `fullWidth` |
| `src/features/assets/components/media-picker/media-picker-gallery.tsx` | Multi-asset gallery thumbnails | `fullWidth` |
| `src/features/tours/components/tour-detail-view.tsx` | Tour detail hero image | `fullWidth` |

### `apps/admin/` (1 file)

| File | Context | Layout |
|------|---------|--------|
| `src/features/admin/components/tours-columns.tsx` | Tour table cover thumbnail | `fullWidth` |

## Conventions

1. **Always import `Image` from `@valguide/ui/components/image`** (or `@valguide/core/ui/components/image` inside core) — never from `@unpic/react` directly
2. **Always use `getAssetImageUrl()`** to build image URLs — never construct URLs manually
3. **Always use `layout="fullWidth"`** unless the image needs a max size constraint
4. **Always provide `alt` text** — use the entity title or file name
5. **Always wrap in a sized container** — the `<Image>` component fills its parent
6. **Always include a fallback** for optional images (cover images, thumbnails)
7. **Use `object-cover`** for thumbnails/cards, **`object-contain`** for galleries/viewers
8. **Never use raw `<img>` tags** for stored assets — always use the `<Image>` component
9. **Never add `@unpic/react` or `unpic` to app-level `package.json`** — the dependency is centralized in `@valguide/core`
