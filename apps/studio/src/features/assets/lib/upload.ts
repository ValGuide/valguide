import { completeUploadFn } from '@valguide/core/features/assets/complete-upload.fn'
import { initUploadFn } from '@valguide/core/features/assets/init-upload.fn'

export type UploadOptions = {
  key: string
  file: File
  onProgress?: (percentage: number) => void
  onError?: (error: Error) => void
}

/**
 * Upload a file to the active object storage provider.
 * Small files (< 50MB) use a single PUT through the /api/upload route.
 * Large files (≥ 50MB) use multipart upload with 10MB parts through /api/upload-part.
 */
export async function uploadFile({ key, file, onProgress, onError }: UploadOptions): Promise<{ key: string }> {
  try {
    const init = await initUploadFn({ data: { key, contentType: file.type, fileSize: file.size } })

    if (init.mode === 'put') {
      await uploadWithProgress(`/api/upload?key=${encodeURIComponent(init.key)}`, file, onProgress)
    } else {
      const completedParts: Array<{ etag: string; partNumber: number }> = []
      let uploadedBytes = 0

      for (let i = 0; i < init.totalParts; i++) {
        const start = i * init.partSize
        const end = Math.min(start + init.partSize, file.size)
        const part = file.slice(start, end)

        const params = new URLSearchParams({
          key: init.key,
          uploadId: init.uploadId,
          partNumber: String(i + 1),
        })

        const response = await fetch(`/api/upload-part?${params}`, { method: 'PUT', body: part })
        if (!response.ok) throw new Error(`Part ${i + 1} upload failed: ${response.status}`)

        const { etag } = (await response.json()) as { etag: string }
        completedParts.push({ etag, partNumber: i + 1 })
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
