import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  CompletedMultipartUploadPart,
  HeadedStorageObject,
  InitializedMultipartUpload,
  ObjectStorageProvider,
  RetrievedStorageObject,
  StorageObjectBody,
} from '../../storage/object-storage'

type StoredMetadata = {
  contentType?: string
  etag: string
}

const storageRoot = path.resolve(process.cwd(), '.local', 'object-storage')
const multipartRoot = path.join(storageRoot, '.multipart')

function normalizeKey(key: string): string {
  const normalized = key.replace(/^\/+/, '')
  if (!normalized || normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error(`Invalid storage key: ${key}`)
  }

  return normalized
}

function objectFilePath(key: string): string {
  return path.join(storageRoot, normalizeKey(key))
}

function metadataFilePath(key: string): string {
  return `${objectFilePath(key)}.meta.json`
}

function multipartDir(uploadId: string): string {
  return path.join(multipartRoot, uploadId)
}

function multipartMetaPath(uploadId: string): string {
  return path.join(multipartDir(uploadId), 'meta.json')
}

function multipartPartPath(uploadId: string, partNumber: number): string {
  return path.join(multipartDir(uploadId), `${partNumber}.part`)
}

async function ensureParentDir(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
}

async function readBody(body: StorageObjectBody): Promise<Buffer> {
  const arrayBuffer = await new Response(body as BodyInit).arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function buildEtag(buffer: Buffer): string {
  return createHash('sha1').update(buffer).digest('hex')
}

async function writeStoredObject(key: string, buffer: Buffer, contentType?: string): Promise<HeadedStorageObject> {
  const filePath = objectFilePath(key)
  const metadataPath = metadataFilePath(key)
  const etag = buildEtag(buffer)

  await ensureParentDir(filePath)
  await writeFile(filePath, buffer)
  await writeFile(metadataPath, JSON.stringify({ contentType, etag } satisfies StoredMetadata))

  return {
    size: buffer.byteLength,
    etag,
  }
}

async function readStoredMetadata(key: string): Promise<StoredMetadata | null> {
  try {
    const raw = await readFile(metadataFilePath(key), 'utf8')
    return JSON.parse(raw) as StoredMetadata
  } catch {
    return null
  }
}

async function getStoredObjectHead(key: string): Promise<HeadedStorageObject | null> {
  try {
    const filePath = objectFilePath(key)
    const [fileStat, metadata] = await Promise.all([stat(filePath), readStoredMetadata(key)])

    return {
      size: fileStat.size,
      etag: metadata?.etag ?? '',
    }
  } catch {
    return null
  }
}

export function getLocalObjectStorageProvider(): ObjectStorageProvider {
  return {
    async putObject(key: string, body: StorageObjectBody, contentType: string): Promise<void> {
      const buffer = await readBody(body)
      await writeStoredObject(key, buffer, contentType)
    },

    async deleteObject(key: string): Promise<void> {
      await Promise.all([rm(objectFilePath(key), { force: true }), rm(metadataFilePath(key), { force: true })])
    },

    async headObject(key: string): Promise<HeadedStorageObject | null> {
      return getStoredObjectHead(key)
    },

    async getObject(key: string): Promise<RetrievedStorageObject | null> {
      try {
        const [buffer, metadata, headed] = await Promise.all([
          readFile(objectFilePath(key)),
          readStoredMetadata(key),
          getStoredObjectHead(key),
        ])

        if (!headed) {
          return null
        }

        return {
          ...headed,
          contentType: metadata?.contentType,
          arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        }
      } catch {
        return null
      }
    },

    async initMultipartUpload(key: string, contentType: string): Promise<InitializedMultipartUpload> {
      const uploadId = randomUUID()
      const uploadDir = multipartDir(uploadId)
      await mkdir(uploadDir, { recursive: true })
      await writeFile(multipartMetaPath(uploadId), JSON.stringify({ key: normalizeKey(key), contentType }))

      return {
        key,
        uploadId,
      }
    },

    async uploadPart(
      key: string,
      uploadId: string,
      partNumber: number,
      body: StorageObjectBody,
    ): Promise<CompletedMultipartUploadPart> {
      const rawMeta = await readFile(multipartMetaPath(uploadId), 'utf8')
      const metadata = JSON.parse(rawMeta) as { key: string; contentType: string }
      if (metadata.key !== normalizeKey(key)) {
        throw new Error(`Upload ${uploadId} does not match key ${key}`)
      }

      const buffer = await readBody(body)
      const partPath = multipartPartPath(uploadId, partNumber)
      await ensureParentDir(partPath)
      await writeFile(partPath, buffer)

      return {
        etag: buildEtag(buffer),
        partNumber,
      }
    },

    async completeMultipartUpload(key: string, uploadId: string, parts: CompletedMultipartUploadPart[]): Promise<void> {
      const rawMeta = await readFile(multipartMetaPath(uploadId), 'utf8')
      const metadata = JSON.parse(rawMeta) as { key: string; contentType: string }
      if (metadata.key !== normalizeKey(key)) {
        throw new Error(`Upload ${uploadId} does not match key ${key}`)
      }

      const buffers = await Promise.all(
        parts
          .sort((a, b) => a.partNumber - b.partNumber)
          .map(async (part) => readFile(multipartPartPath(uploadId, part.partNumber))),
      )

      await writeStoredObject(key, Buffer.concat(buffers), metadata.contentType)
      await rm(multipartDir(uploadId), { recursive: true, force: true })
    },
  }
}
