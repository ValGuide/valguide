// Mock for @valguide/core/features/assets/server-functions

export type AssetType = 'image' | 'audio' | 'video'

export type UploadCredentials = {
  accessToken: string
  projectId: string
}

export type AssetUsageDetails = {
  guides: Array<{
    id: string
    nanoId: string
    name: string
    role: string
    locale: string | null
  }>
  stops: Array<{
    id: string
    nanoId: string
    name: string
    role: string
    locale: string | null
  }>
}

export const getUploadCredentialsFn = async () => ({
  accessToken: 'mock-token',
  projectId: 'mock-project',
})

export const confirmAssetUploadFn = async () => ({
  id: 'mock-id',
  nanoId: 'mock-nano-id',
})

export const deleteAssetFn = async () => ({ success: true })

export const getAssetUsageDetailsFn = async (): Promise<AssetUsageDetails> => ({
  guides: [],
  stops: [],
})
