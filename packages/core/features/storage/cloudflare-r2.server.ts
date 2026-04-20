import { env } from 'cloudflare:workers'
import type {
  CompletedMultipartUploadPart,
  HeadedStorageObject,
  InitializedMultipartUpload,
  ObjectStorageProvider,
  RetrievedStorageObject,
  StorageObjectBody,
} from './object-storage'

function getR2BucketBinding(): R2Bucket {
  const bucket = env.R2_BUCKET

  if (!bucket) {
    throw new Error('R2 bucket binding is unavailable')
  }

  return bucket
}

function toHeadedStorageObject(object: R2Object): HeadedStorageObject {
  return {
    size: object.size,
    etag: object.etag,
  }
}

function toRetrievedStorageObject(object: R2ObjectBody): RetrievedStorageObject {
  return {
    ...toHeadedStorageObject(object),
    contentType: object.httpMetadata?.contentType,
    arrayBuffer: () => object.arrayBuffer(),
  }
}

export function getCloudflareR2ObjectStorageProvider(): ObjectStorageProvider {
  return {
    async putObject(key: string, body: StorageObjectBody, contentType: string): Promise<void> {
      const bucket = getR2BucketBinding()
      await bucket.put(key, body, {
        httpMetadata: { contentType },
      })
    },

    async deleteObject(key: string): Promise<void> {
      const bucket = getR2BucketBinding()
      await bucket.delete(key)
    },

    async headObject(key: string): Promise<HeadedStorageObject | null> {
      const bucket = getR2BucketBinding()
      const object = await bucket.head(key)

      return object ? toHeadedStorageObject(object) : null
    },

    async getObject(key: string): Promise<RetrievedStorageObject | null> {
      const bucket = getR2BucketBinding()
      const object = await bucket.get(key)

      return object ? toRetrievedStorageObject(object) : null
    },

    async initMultipartUpload(key: string, contentType: string): Promise<InitializedMultipartUpload> {
      const bucket = getR2BucketBinding()
      const upload = await bucket.createMultipartUpload(key, {
        httpMetadata: { contentType },
      })

      return {
        key,
        uploadId: upload.uploadId,
      }
    },

    async uploadPart(
      key: string,
      uploadId: string,
      partNumber: number,
      body: StorageObjectBody,
    ): Promise<CompletedMultipartUploadPart> {
      const bucket = getR2BucketBinding()
      const upload = bucket.resumeMultipartUpload(key, uploadId)
      const part = await upload.uploadPart(partNumber, body)

      return {
        etag: part.etag,
        partNumber: part.partNumber,
      }
    },

    async completeMultipartUpload(key: string, uploadId: string, parts: CompletedMultipartUploadPart[]): Promise<void> {
      const bucket = getR2BucketBinding()
      const upload = bucket.resumeMultipartUpload(key, uploadId)
      await upload.complete(parts)
    },
  }
}
