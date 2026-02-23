/**
 * Cloudflare Workers R2 type declarations.
 * Subset of @cloudflare/workers-types — only what we use.
 * Can be removed if @cloudflare/workers-types is installed.
 */

declare module 'cloudflare:workers' {
  const env: {
    R2_BUCKET: R2Bucket
    [key: string]: unknown
  }
  function waitUntil(promise: Promise<unknown>): void
  export { env, waitUntil }
}

interface R2Bucket {
  head(key: string): Promise<R2Object | null>
  get(key: string): Promise<R2ObjectBody | null>
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: R2PutOptions,
  ): Promise<R2Object | null>
  delete(keys: string | string[]): Promise<void>
  createMultipartUpload(key: string, options?: R2MultipartOptions): Promise<R2MultipartUpload>
  resumeMultipartUpload(key: string, uploadId: string): R2MultipartUpload
}

interface R2Object {
  key: string
  size: number
  etag: string
  httpEtag: string
  uploaded: Date
  httpMetadata?: R2HTTPMetadata
  customMetadata?: Record<string, string>
  writeHttpMetadata(headers: Headers): void
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream
  bodyUsed: boolean
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
  json<T>(): Promise<T>
  blob(): Promise<Blob>
}

interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata | Headers
  customMetadata?: Record<string, string>
}

interface R2MultipartOptions {
  httpMetadata?: R2HTTPMetadata | Headers
  customMetadata?: Record<string, string>
}

interface R2HTTPMetadata {
  contentType?: string
  contentLanguage?: string
  contentDisposition?: string
  contentEncoding?: string
  cacheControl?: string
  cacheExpiry?: Date
}

interface R2MultipartUpload {
  key: string
  uploadId: string
  uploadPart(
    partNumber: number,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  ): Promise<R2UploadedPart>
  abort(): Promise<void>
  complete(uploadedParts: R2UploadedPart[]): Promise<R2Object>
}

interface R2UploadedPart {
  partNumber: number
  etag: string
}
