---
title: "File Uploads (R2 Native Binding)"
---

All file uploads use **Cloudflare R2** via native Worker bindings. Small files use a single PUT through an API route, large files use R2's multipart upload API — all proxied through the Worker.

## Architecture

```
Client (browser)                    Worker (TanStack Start)         Cloudflare R2
      │                                    │                            │
      ├── initUploadFn({ key, fileSize })──►│  Decides PUT vs multipart  │
      │◄── { mode, key | uploadId } ───────┤                            │
      │                                    │                            │
      ├── PUT /api/upload ────────────────►│── bucket.put() ───────────►│
      │   (streams body to R2)             │                            │
      │                                    │                            │
      ├── PUT /api/upload-part ───────────►│── upload.uploadPart() ────►│
      │   (multipart only, per chunk)      │                            │
      │                                    │                            │
      ├── completeUploadFn() ─────────────►│── upload.complete() ──────►│
      │   (multipart only)                 │                            │
      │                                    │                            │
      ├── confirmAssetUploadFn() ─────────►│  Creates DB record         │
      │◄── Asset ──────────────────────────┤                            │
```

## Upload Strategy

| File Size | Method | How |
|-----------|--------|-----|
| **< 50 MB** | Single PUT via `/api/upload` | Streams `request.body` directly to R2 |
| **≥ 50 MB** | R2 multipart via `/api/upload-part` | 10 MB parts, streamed per-part |

The **server decides** the mode based on `fileSize`. The client uploads through Worker API routes (no presigned URLs).

## Storage Paths

| Use Case | Path Pattern | Example |
|----------|-------------|---------|
| Asset upload | `assets/{assetId}/{fileId}.{ext}` | `assets/aBcDeFgHiJ/xYz1234567.mp3` |
| Workspace logo | `orgs/{orgNanoId}/logos/{fileId}.{ext}` | `orgs/aBcDeFgHiJ/logos/xYz1234567.png` |
| Profile avatar | `users/{profileId}/avatars/{fileId}.{ext}` | `users/aBcDeFgHiJ/avatars/xYz1234567.jpg` |
| Studio feedback screenshot | `studio-feedback/{feedbackId}/{fileId}.{ext}` | `studio-feedback/aBcDeFgHiJ/xYz1234567.png` |

All IDs are 10-char alphanumeric nanoids via `valguideId()`.

## Design Principles

- **Org-independent paths for moveable content**: Assets can be reassigned between organizations without S3 migration.
- **Org/user-scoped paths for non-transferable files**: Logos and avatars are inherently owned.
- **No original filenames in paths**: Stored in DB only. Paths use `valguideId()` for uniqueness and cache-busting.
- **Entity ID generated before upload**: The `assetId` must exist before upload so the path is deterministic.
- **Streaming**: API routes stream `request.body` directly to R2 — no buffering in Worker memory.

## Client API

```ts
import { uploadFile } from '@/features/assets/lib/upload'

const result = await uploadFile({
  key: 'assets/aBcDeFgHiJ/xYz1234567.mp3',
  file: myFile,
  onProgress: (percent) => setProgress(percent),
  onError: (err) => setError(err.message),
})
// result.key === 'assets/aBcDeFgHiJ/xYz1234567.mp3'
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | `string` | ✅ | Full storage path (R2 object key) |
| `file` | `File` | ✅ | Browser File object |
| `onProgress` | `(percentage: number) => void` | — | Progress callback (0–100) |
| `onError` | `(error: Error) => void` | — | Error callback |

## Server Functions

### `initUploadFn` — Initialize upload

```ts
import { initUploadFn } from '@valguide/core/features/assets/init-upload.fn'

const result = await initUploadFn({
  data: { key: 'assets/abc/xyz.mp3', contentType: 'audio/mpeg', fileSize: 1024000 }
})
// Returns: { mode: 'put', key }
// Or:      { mode: 'multipart', key, uploadId, totalParts, partSize }
```

### `completeUploadFn` — Complete multipart upload

```ts
import { completeUploadFn } from '@valguide/core/features/assets/complete-upload.fn'

await completeUploadFn({
  data: { key, uploadId, parts: [{ etag: '...', partNumber: 1 }] }
})
```

### `confirmAssetUploadFn` — Create asset DB record

Called after upload completes to register the asset in the database.

## API Routes (Worker)

### `PUT /api/upload` — Simple file upload

Streams the request body directly to R2 via native binding. Auth validated via Better Auth session cookie.

```
PUT /api/upload?key=assets/abc/xyz.mp3
Content-Type: audio/mpeg
Body: <file bytes>
```

### `PUT /api/upload-part` — Multipart part upload

Uploads a single part of a multipart upload to R2.

```
PUT /api/upload-part?key=assets/abc/xyz.mp3&uploadId=xxx&partNumber=1
Body: <part bytes>
→ { etag: "...", partNumber: 1 }
```

## URL Resolution

Asset URLs are derived at read time from `storagePath` — never stored:

```ts
import { getAssetUrl, getImageKitUrl, getAssetDisplayUrl } from '@valguide/core/features/assets/image-url'

// Direct R2 URL (audio/video — served via Cloudflare CDN, $0 egress)
getAssetUrl('assets/abc/xyz.mp3')
// → https://assets.valguide.com/assets/abc/xyz.mp3

// ImageKit URL (images — transforms + CDN optimization)
getImageKitUrl('assets/abc/xyz.jpg')
// → https://ik.imagekit.io/valguide/assets/abc/xyz.jpg

// Auto-pick based on asset type
getAssetDisplayUrl({ storagePath: '...', type: 'image' })  // → ImageKit
getAssetDisplayUrl({ storagePath: '...', type: 'audio' })  // → R2 direct
```

## R2 Infrastructure

### Buckets

| Environment | Bucket | Public URL | Binding |
|-------------|--------|-----------|---------|
| Dev | `valguide-dev` | `https://assets.valguide.dev` | `R2_BUCKET` |
| Prod | `valguide-prod` | `https://assets.valguide.com` | `R2_BUCKET` |

Configured as native R2 bindings in `wrangler.jsonc` — no API keys needed.

### Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_ASSET_BASE_URL` | Client | Preferred public base URL for assets |
| `VITE_R2_PUBLIC_URL` | Client | Legacy fallback public base URL for assets |

R2 access uses native Worker bindings configured in `wrangler.jsonc`. No `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, or `R2_ENDPOINT` needed.

## Server-Side Upload (Admin)

For server-side uploads (e.g., admin logo upload from base64):

```ts
import { putObject } from '@valguide/core/platform/storage/object-storage.server'

await putObject(storagePath, buffer, contentType)
```

## File Structure

```
packages/core/platform/
├── providers/cloudflare/workers.d.ts  # Cloudflare Workers type declarations (R2, KV)
├── providers/cloudflare/object-storage.server.ts
├── storage/object-storage.ts
└── storage/object-storage.server.ts    # put, delete, head, multipart

packages/core/features/assets/
├── init-upload.fn.ts          # Server function: decides PUT vs multipart
├── complete-upload.fn.ts      # Server function: completes multipart
├── image-url.ts               # getAssetUrl, getImageKitUrl, getAssetDisplayUrl
├── confirm-upload.server.ts   # Creates asset DB record
├── confirm-upload.fn.ts       # Server function wrapper
└── delete-asset.server.ts     # Deletes from R2 + DB

apps/studio/src/
├── routes/
│   ├── api.upload.ts          # PUT /api/upload — streams to R2
│   └── api.upload-part.ts     # PUT /api/upload-part — multipart parts
└── features/assets/lib/
    └── upload.ts              # Client upload (PUT + multipart via API routes)
```

## Adding a New Upload Use Case

1. Decide if the file is **moveable** (entity ID path) or **non-transferable** (scope by owner)
2. Generate the entity ID (`valguideId()`) before upload
3. Use `valguideId()` for per-file uniqueness (`fileId`)
4. Call `uploadFile({ key, file, onProgress })` from the client
5. After upload, persist `storagePath` to the database via a server function
6. Derive display URLs at read time using `getAssetUrl()` or `getAssetDisplayUrl()`
