export type StorageObjectBody = ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob

export type HeadedStorageObject = {
  size: number
  etag: string
}

export type RetrievedStorageObject = HeadedStorageObject & {
  contentType?: string
  arrayBuffer(): Promise<ArrayBuffer>
}

export type CompletedMultipartUploadPart = {
  etag: string
  partNumber: number
}

export type InitializedMultipartUpload = {
  key: string
  uploadId: string
}

export interface ObjectStorageProvider {
  putObject(key: string, body: StorageObjectBody, contentType: string): Promise<void>
  deleteObject(key: string): Promise<void>
  headObject(key: string): Promise<HeadedStorageObject | null>
  getObject(key: string): Promise<RetrievedStorageObject | null>
  initMultipartUpload(key: string, contentType: string): Promise<InitializedMultipartUpload>
  uploadPart(
    key: string,
    uploadId: string,
    partNumber: number,
    body: StorageObjectBody,
  ): Promise<CompletedMultipartUploadPart>
  completeMultipartUpload(key: string, uploadId: string, parts: CompletedMultipartUploadPart[]): Promise<void>
}
