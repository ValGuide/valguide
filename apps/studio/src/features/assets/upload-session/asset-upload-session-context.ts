import type { Asset } from '@valguide/core/features/assets/types'
import * as React from 'react'
import type { AssetUploadStatus } from './asset-upload-session.utils'

export type AssetUploadItem = {
  id: string
  file: File
  type: 'image' | 'audio' | 'video'
  previewUrl: string | null
  status: AssetUploadStatus
  progress: number
  error: string | null
  asset: Asset | null
  createdAt: number
}

export type AssetUploadSessionContextValue = {
  items: AssetUploadItem[]
  isExpanded: boolean
  isDragActive: boolean
  hasVisibleUploads: boolean
  openFilePicker: () => void
  setExpanded: (nextOpen: boolean) => void
  closeSurface: () => void
  dismissItem: (itemId: string) => void
  retryItem: (itemId: string) => void
  clearCompleted: () => void
}

export const AssetUploadSessionContext = React.createContext<AssetUploadSessionContextValue | null>(null)

export function useAssetUploadSession() {
  const context = React.useContext(AssetUploadSessionContext)

  if (!context) {
    throw new Error('useAssetUploadSession must be used within AssetUploadSessionProvider')
  }

  return context
}
