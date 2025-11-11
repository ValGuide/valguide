// Mock asset actions for Storybook
export async function getUploadSignedUrl(...args: any[]) {
  return {
    signedUrl: 'https://example.com/upload',
    path: 'mock/path',
    token: 'mock-token',
    assetId: 'mock-asset-id',
  }
}

export async function confirmAssetUpload(...args: any[]) {
  return {} as any
}

export async function deleteAsset(...args: any[]) {
  return { success: true }
}

export async function getDownloadSignedUrl(...args: any[]) {
  return { signedUrl: 'https://example.com/download' }
}

export function validateFileSize(...args: any[]) {
  return true
}

export function getAllowedMimeTypes(type: string) {
  return ['image/*']
}

export type AssetType = 'image' | 'audio' | 'video'
export type GetUploadSignedUrlParams = any
export type GetUploadSignedUrlResult = any
export type ConfirmAssetUploadParams = any
