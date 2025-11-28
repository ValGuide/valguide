import { getUploadCredentials } from '@valguide/core/features/assets/actions/get-upload-credentials'
import * as tus from 'tus-js-client'

export type TUSUploadOptions = {
  bucketName: string
  fileName: string
  file: File
  onProgress?: (percentage: number) => void
  onError?: (error: Error) => void
  metadata?: Record<string, string>
}

export async function uploadFileWithTUS({
  bucketName,
  fileName,
  file,
  onProgress,
  onError,
  metadata = {},
}: TUSUploadOptions): Promise<{ path: string }> {
  // Get secure upload credentials from server action
  const { accessToken, projectId } = await getUploadCredentials()

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
