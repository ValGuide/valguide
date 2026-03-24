import { type DeleteAssetsResult, deleteAssetsFn } from '@valguide/core/features/assets/delete-assets.fn'
import {
  type BulkAssetDeletionPreview,
  getBulkAssetDeletionPreviewFn,
} from '@valguide/core/features/assets/get-bulk-asset-deletion-preview.fn'
import { useState } from 'react'
import type { BulkDeleteAssetsDialogProps } from './bulk-delete-assets-dialog'
import { BulkDeleteAssetsDialog } from './bulk-delete-assets-dialog'

type BulkDeleteAssetsDialogConnectedProps = Omit<
  BulkDeleteAssetsDialogProps,
  'onGetPreview' | 'onConfirmDelete' | 'isDeleting'
> & {
  onDeleteComplete: (result: DeleteAssetsResult) => Promise<void> | void
}

export function BulkDeleteAssetsDialogConnected({ onDeleteComplete, ...props }: BulkDeleteAssetsDialogConnectedProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleGetPreview = async (assetIds: string[]): Promise<BulkAssetDeletionPreview> => {
    return getBulkAssetDeletionPreviewFn({ data: { assetIds } })
  }

  const handleConfirmDelete = async (assetIds: string[]) => {
    setIsDeleting(true)
    const result = await deleteAssetsFn({ data: { assetIds } })
    try {
      await onDeleteComplete(result)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <BulkDeleteAssetsDialog
      {...props}
      isDeleting={isDeleting}
      onGetPreview={handleGetPreview}
      onConfirmDelete={handleConfirmDelete}
    />
  )
}
