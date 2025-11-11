import type { AssetType } from './schema'

export function validateFileSize(fileSize: number, type: AssetType): boolean {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    audio: 50 * 1024 * 1024, // 50MB
    video: 500 * 1024 * 1024, // 500MB
  }

  return fileSize <= maxSizes[type]
}

export function getAllowedMimeTypes(type: AssetType): string[] {
  const allowedMimeTypes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
  }

  return allowedMimeTypes[type]
}

export function validateFile(fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
  return { sanitizedName }
}
