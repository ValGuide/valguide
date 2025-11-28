// biome-ignore-all lint/suspicious/noExplicitAny: Mock file for Storybook - types are intentionally loose
export async function getUploadSignedUrl(..._args: unknown[]) {
  return {
    signedUrl: 'https://example.com/upload',
    path: 'mock/path',
    token: 'mock-token',
    assetId: 'mock-asset-id',
  }
}

export async function confirmAssetUpload(..._args: unknown[]) {
  return {}
}

export async function deleteAsset(..._args: unknown[]) {
  return { success: true }
}

export async function getDownloadSignedUrl(..._args: unknown[]) {
  return { signedUrl: 'https://example.com/download' }
}

export function validateFileSize(..._args: unknown[]) {
  return true
}

export function getAllowedMimeTypes(_type: string) {
  return ['image/*']
}

export type AssetType = 'image' | 'audio' | 'video'
export type GetUploadSignedUrlParams = Record<string, unknown>
export type GetUploadSignedUrlResult = Record<string, unknown>
export type ConfirmAssetUploadParams = Record<string, unknown>
