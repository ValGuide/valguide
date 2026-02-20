/// <reference path="./cloudflare-r2.d.ts" />
import { getR2Bucket } from './r2'

export const MULTIPART_THRESHOLD = 50 * 1024 * 1024 // 50 MB
export const PART_SIZE = 10 * 1024 * 1024 // 10 MB per part

// ── Simple PUT ──────────────────────────────────────────────────────

export async function putObject(
  key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  contentType: string,
): Promise<void> {
  await getR2Bucket().put(key, body, {
    httpMetadata: { contentType },
  })
}

// ── Delete ──────────────────────────────────────────────────────────

export async function deleteObject(key: string): Promise<void> {
  await getR2Bucket().delete(key)
}

// ── Head ────────────────────────────────────────────────────────────

export async function headObject(key: string): Promise<{ size: number; etag: string } | null> {
  const obj = await getR2Bucket().head(key)
  if (!obj) return null
  return { size: obj.size, etag: obj.etag }
}

// ── Multipart ───────────────────────────────────────────────────────

export async function initMultipartUpload(key: string, contentType: string) {
  const upload = await getR2Bucket().createMultipartUpload(key, {
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
  const upload = getR2Bucket().resumeMultipartUpload(key, uploadId)
  return upload.uploadPart(partNumber, body)
}

export async function completeMultipartUpload(key: string, uploadId: string, parts: R2UploadedPart[]): Promise<void> {
  const upload = getR2Bucket().resumeMultipartUpload(key, uploadId)
  await upload.complete(parts)
}

// ── Verify ──────────────────────────────────────────────────────────

export async function verifyUpload(key: string, expectedSize: number): Promise<boolean> {
  const obj = await headObject(key)
  if (!obj) return false
  return obj.size === expectedSize
}
