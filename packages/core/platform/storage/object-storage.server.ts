import { getCloudflareR2ObjectStorageProvider } from '../providers/cloudflare/object-storage.server'
import type { CompletedMultipartUploadPart, RetrievedStorageObject, StorageObjectBody } from './object-storage'

export const MULTIPART_THRESHOLD = 50 * 1024 * 1024 // 50 MB
export const PART_SIZE = 10 * 1024 * 1024 // 10 MB per part

function getObjectStorageProvider() {
  return getCloudflareR2ObjectStorageProvider()
}

// ── Simple PUT ──────────────────────────────────────────────────────

export async function putObject(key: string, body: StorageObjectBody, contentType: string): Promise<void> {
  await getObjectStorageProvider().putObject(key, body, contentType)
}

// ── Delete ──────────────────────────────────────────────────────────

export async function deleteObject(key: string): Promise<void> {
  await getObjectStorageProvider().deleteObject(key)
}

// ── Head ────────────────────────────────────────────────────────────

export async function headObject(key: string): Promise<{ size: number; etag: string } | null> {
  return getObjectStorageProvider().headObject(key)
}

export async function getObject(key: string): Promise<RetrievedStorageObject | null> {
  return getObjectStorageProvider().getObject(key)
}

// ── Multipart ───────────────────────────────────────────────────────

export async function initMultipartUpload(key: string, contentType: string) {
  return getObjectStorageProvider().initMultipartUpload(key, contentType)
}

export async function uploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  body: StorageObjectBody,
): Promise<CompletedMultipartUploadPart> {
  return getObjectStorageProvider().uploadPart(key, uploadId, partNumber, body)
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: CompletedMultipartUploadPart[],
): Promise<void> {
  await getObjectStorageProvider().completeMultipartUpload(key, uploadId, parts)
}

// ── Verify ──────────────────────────────────────────────────────────

export async function verifyUpload(key: string, expectedSize: number): Promise<boolean> {
  const obj = await headObject(key)
  if (!obj) return false
  return obj.size === expectedSize
}
