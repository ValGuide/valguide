import type { AssetType } from './schema'

export const MAX_SIZE_MB: Record<AssetType, number> = {
  image: 10,
  audio: 50,
  video: 500,
}

export function validateFileSize(fileSize: number, type: AssetType): boolean {
  const maxSizeBytes = MAX_SIZE_MB[type] * 1024 * 1024
  return fileSize <= maxSizeBytes
}

const ALLOWED_MIME_TYPES: Record<AssetType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif', 'image/heic'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a', 'audio/x-m4a'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
}

export function getAllowedMimeTypes(type: AssetType): string[] {
  return ALLOWED_MIME_TYPES[type]
}

export function getAllAllowedMimeTypes(): string[] {
  return [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.audio, ...ALLOWED_MIME_TYPES.video]
}

export function detectAssetType(file: File): AssetType | null {
  const mime = file.type || ''

  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('video/')) return 'video'

  const name = file.name.toLowerCase()
  if (/\.(png|jpe?g|webp|gif|avif|heic|svg)$/.test(name)) return 'image'
  if (/\.(mp3|wav|m4a|ogg|flac|aac)$/.test(name)) return 'audio'
  if (/\.(mp4|mov|webm|mkv|avi)$/.test(name)) return 'video'

  return null
}

export function validateFile(fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
  return { sanitizedName }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}
