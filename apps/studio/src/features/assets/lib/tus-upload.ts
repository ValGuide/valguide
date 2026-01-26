/**
 * TUS (Resumable Upload Protocol) client for Supabase Storage
 *
 * This module handles file uploads to Supabase Storage using the TUS protocol,
 * which provides:
 * - Resumable uploads: If a connection fails, uploads can be resumed from where they stopped
 * - Progress tracking: Real-time upload progress for UI feedback
 * - Chunked uploads: Large files are split into 6MB chunks (Supabase requirement)
 * - Auto-retry: Failed uploads are automatically retried with exponential backoff
 *
 * Usage:
 * ```ts
 * const result = await uploadFileWithTUS({
 *   bucketName: 'studio-feedback',
 *   fileName: 'screenshot.png',
 *   file: myFile,
 *   onProgress: (percent) => setProgress(percent),
 *   credentials: { accessToken, projectId },
 * })
 * ```
 *
 * @see https://tus.io/ - TUS Protocol specification
 * @see https://supabase.com/docs/guides/storage/uploads/resumable-uploads - Supabase TUS docs
 */
import * as tus from 'tus-js-client'

import { getUploadCredentialsFn } from '@valguide/core/features/assets/get-upload-credentials'


export type UploadCredentials = {
  accessToken: string
  projectId: string
}

export type TUSUploadOptions = {
  bucketName: string
  fileName: string
  file: File
  onProgress?: (percentage: number) => void
  onError?: (error: Error) => void
  metadata?: Record<string, string>
  /** Pre-fetched credentials (if not provided, will fetch from getUploadCredentialsFn) */
  credentials?: UploadCredentials
}

export async function uploadFileWithTUS({
  bucketName,
  fileName,
  file,
  onProgress,
  onError,
  metadata = {},
  credentials,
}: TUSUploadOptions): Promise<{ path: string }> {
  // Use provided credentials or fetch from server action
  let accessToken: string
  let projectId: string

  if (credentials) {
    accessToken = credentials.accessToken
    projectId = credentials.projectId
  } else {
    const creds = await getUploadCredentialsFn()
    accessToken = creds.accessToken
    projectId = creds.projectId
  }

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      // Direct storage endpoint for better performance
      endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,

      // Retry delays in milliseconds
      retryDelays: [0, 3000, 5000, 10000, 20000],

      // Auth headers
      headers: {
        authorization: `Bearer ${accessToken}`,
        'x-upsert': 'true', // Overwrite existing files
      },

      // Upload settings
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true, // Allow re-uploading same file

      // File metadata
      metadata: {
        bucketName: bucketName,
        objectName: fileName,
        contentType: file.type,
        cacheControl: '3600',
        ...metadata,
      },

      // MUST be 6MB for Supabase
      chunkSize: 6 * 1024 * 1024,

      // Progress tracking
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal) * 100
        onProgress?.(percentage)
      },

      // Success handler
      onSuccess: () => {
        resolve({ path: fileName })
      },

      // Error handler
      onError: (error) => {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        reject(err)
      },
    })

    // Check for previous incomplete uploads and resume
    upload
      .findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length && previousUploads[0]) {
          upload.resumeFromPreviousUpload(previousUploads[0])
        }
        upload.start()
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        reject(err)
      })
  })
}
