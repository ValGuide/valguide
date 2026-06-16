import { isLocalRuntime } from '../runtime/runtime-mode.server'
import type { CompletedMultipartUploadPart, RetrievedStorageObject, StorageObjectBody } from './object-storage'

export const MULTIPART_THRESHOLD = 50 * 1024 * 1024 // 50 MB
export const PART_SIZE = 10 * 1024 * 1024 // 10 MB per part

async function getObjectStorageProvider() {
  if (isLocalRuntime()) {
    const { getLocalObjectStorageProvider } = await import('../providers/local/object-storage.server')
    return getLocalObjectStorageProvider()
  }

  const { getCloudflareR2ObjectStorageProvider } = await import('../providers/cloudflare/object-storage.server')
  return getCloudflareR2ObjectStorageProvider()
}

export async function putObject(key: string, body: StorageObjectBody, contentType: string): Promise<void> {
  const provider = await getObjectStorageProvider()
  await provider.putObject(key, body, contentType)
}

export async function deleteObject(key: string): Promise<void> {
  const provider = await getObjectStorageProvider()
  await provider.deleteObject(key)
}

export async function getObject(key: string): Promise<RetrievedStorageObject | null> {
  const provider = await getObjectStorageProvider()
  return provider.getObject(key)
}

export async function initMultipartUpload(key: string, contentType: string) {
  const provider = await getObjectStorageProvider()
  return provider.initMultipartUpload(key, contentType)
}

export async function uploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  body: StorageObjectBody,
): Promise<CompletedMultipartUploadPart> {
  const provider = await getObjectStorageProvider()
  return provider.uploadPart(key, uploadId, partNumber, body)
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: CompletedMultipartUploadPart[],
): Promise<void> {
  const provider = await getObjectStorageProvider()
  await provider.completeMultipartUpload(key, uploadId, parts)
}
