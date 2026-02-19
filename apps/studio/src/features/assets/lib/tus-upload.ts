import { completeUploadFn } from '@valguide/core/features/storage/complete-upload.fn'
import { initUploadFn } from '@valguide/core/features/storage/init-upload.fn'

export type UploadOptions = {
  key: string
  file: File
  onProgress?: (percentage: number) => void
  onError?: (error: Error) => void
}

/**
 * Upload a file to R2 via presigned URLs.
 * Small files (< 50MB) use a single PUT request.
 * Large files (≥ 50MB) use S3 multipart upload with 10MB parts.
 */
export async function uploadFile({ key, file, onProgress, onError }: UploadOptions): Promise<{ key: string }> {
  try {
    const init = await initUploadFn({ data: { key, contentType: file.type, fileSize: file.size } })

    if (init.mode === 'put') {
      await uploadWithProgress(init.putUrl, file, onProgress)
    } else {
      const completedParts: Array<{ ETag: string; PartNumber: number }> = []
      let uploadedBytes = 0

      for (let i = 0; i < init.partUrls.length; i++) {
        const start = i * init.partSize
        const end = Math.min(start + init.partSize, file.size)
        const part = file.slice(start, end)

        const response = await fetch(init.partUrls[i], { method: 'PUT', body: part })
        if (!response.ok) throw new Error(`Part ${i + 1} upload failed: ${response.status}`)

        const etag = response.headers.get('ETag')
        if (!etag) throw new Error(`Missing ETag for part ${i + 1}`)

        completedParts.push({ ETag: etag, PartNumber: i + 1 })
        uploadedBytes += end - start
        onProgress?.((uploadedBytes / file.size) * 100)
      }

      await completeUploadFn({ data: { key, uploadId: init.uploadId, parts: completedParts } })
    }

    return { key }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    onError?.(err)
    throw err
  }
}

/**
 * Upload a file with XMLHttpRequest for progress tracking (single PUT).
 */
function uploadWithProgress(url: string, file: File, onProgress?: (percentage: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.((e.loaded / e.total) * 100)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed: network error'))
    xhr.send(file)
  })
}
