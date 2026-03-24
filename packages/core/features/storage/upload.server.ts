import { getR2Bucket } from './r2'

export const MULTIPART_THRESHOLD = 50 * 1024 * 1024 // 50 MB
export const PART_SIZE = 10 * 1024 * 1024 // 10 MB per part

// ── Simple PUT ──────────────────────────────────────────────────────

export async function putObject(
  key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  contentType: string,
): Promise<void> {
  const bucket = await getR2Bucket()
  await bucket.put(key, body, {
    httpMetadata: { contentType },
  })
}

// ── Delete ──────────────────────────────────────────────────────────

export async function deleteObject(key: string): Promise<void> {
  const bucket = await getR2Bucket()
  await bucket.delete(key)
}

// ── Head ────────────────────────────────────────────────────────────

export async function headObject(key: string): Promise<{ size: number; etag: string } | null> {
  const bucket = await getR2Bucket()
  const obj = await bucket.head(key)
  if (!obj) return null
  return { size: obj.size, etag: obj.etag }
}

// ── Multipart ───────────────────────────────────────────────────────

export async function initMultipartUpload(key: string, contentType: string) {
  const bucket = await getR2Bucket()
  const upload = await bucket.createMultipartUpload(key, {
    httpMetadata: { contentType },
  })
  return { uploadId: upload.uploadId, key }
}

export async function uploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
): Promise<R2UploadedPart> {
  const bucket = await getR2Bucket()
  const upload = bucket.resumeMultipartUpload(key, uploadId)
  return upload.uploadPart(partNumber, body)
}

export async function completeMultipartUpload(key: string, uploadId: string, parts: R2UploadedPart[]): Promise<void> {
  const bucket = await getR2Bucket()
  const upload = bucket.resumeMultipartUpload(key, uploadId)
  await upload.complete(parts)
}

// ── Verify ──────────────────────────────────────────────────────────

export async function verifyUpload(key: string, expectedSize: number): Promise<boolean> {
  const obj = await headObject(key)
  if (!obj) return false
  return obj.size === expectedSize
}
