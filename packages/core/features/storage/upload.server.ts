import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getR2Bucket, getR2Client } from './r2'

export const MULTIPART_THRESHOLD = 50 * 1024 * 1024 // 50 MB
export const PART_SIZE = 10 * 1024 * 1024 // 10 MB per part

// ── Simple PUT (small files) ────────────────────────────────────────

export async function createPresignedPutUrl(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new PutObjectCommand({ Bucket: getR2Bucket(), Key: key, ContentType: contentType }),
    { expiresIn: 300 }, // 5 minutes
  )
}

// ── Multipart (large files) ─────────────────────────────────────────

export async function initMultipartUpload(key: string, contentType: string) {
  const { UploadId } = await getR2Client().send(
    new CreateMultipartUploadCommand({ Bucket: getR2Bucket(), Key: key, ContentType: contentType }),
  )
  if (!UploadId) throw new Error('Failed to initiate upload')
  return { uploadId: UploadId, key }
}

export async function getPartUploadUrls(key: string, uploadId: string, totalParts: number) {
  return Promise.all(
    Array.from({ length: totalParts }, (_, i) =>
      getSignedUrl(
        getR2Client(),
        new UploadPartCommand({
          Bucket: getR2Bucket(),
          Key: key,
          UploadId: uploadId,
          PartNumber: i + 1,
        }),
        { expiresIn: 3600 }, // 1 hour (large files take time)
      ),
    ),
  )
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ ETag: string; PartNumber: number }>,
) {
  await getR2Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: getR2Bucket(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    }),
  )
}

// ── Verify upload exists (used by confirmUpload) ────────────────────

// ── Direct PUT (server-side, for small files like logos) ─────────────

export async function putObject(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

// ── Verify upload exists (used by confirmUpload) ────────────────────

export async function verifyUpload(key: string, expectedSize: number): Promise<boolean> {
  try {
    const head = await getR2Client().send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }))
    return head.ContentLength === expectedSize
  } catch {
    return false
  }
}
