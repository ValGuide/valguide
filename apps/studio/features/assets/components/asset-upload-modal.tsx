'use client'

import { useState, useCallback } from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { useUppy, Dashboard } from '@uppy/react'
import {
  getUploadSignedUrl,
  confirmAssetUpload,
  type AssetType,
  validateFileSize,
  getAllowedMimeTypes,
} from '@valguide/core/features/assets/actions'
import type { Asset } from '@valguide/core/features/assets/schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Button } from '@valguide/ui/components/button'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

// Note: CSS imports handled globally in app layout
// import '@uppy/core/dist/style.css'
// import '@uppy/dashboard/dist/style.css'

export type AssetUploadModalProps = {
  type: AssetType
  locale?: string
  organizationId: string
  onUploadComplete?: (asset: Asset) => void
  trigger?: React.ReactNode
}

export function AssetUploadModal({
  type,
  locale,
  organizationId,
  onUploadComplete,
  trigger,
}: AssetUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleUploadComplete = useCallback(
    (asset: Asset) => {
      onUploadComplete?.(asset)
      toast.success('Upload complete', {
        description: `${asset.fileName} uploaded successfully`,
      })
      setIsOpen(false)
    },
    [onUploadComplete],
  )

  const uppy = useUppy(() => {
    const maxFileSize = type === 'video' ? 500 * 1024 * 1024 : type === 'audio' ? 50 * 1024 * 1024 : 10 * 1024 * 1024

    const uppyInstance = new Uppy({
      restrictions: {
        maxFileSize,
        allowedFileTypes: getAllowedMimeTypes(type),
        maxNumberOfFiles: 10,
      },
      autoProceed: false,
    })

    uppyInstance.use(Tus, {
      endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
      async onBeforeRequest(req, file) {
        try {
          // Validate file size
          if (!validateFileSize(file.size!, type)) {
            throw new Error(`File size exceeds limit for ${type}`)
          }

          // Get signed upload URL for this file
          const { signedUrl, path, assetId } = await getUploadSignedUrl({
            fileName: file.name,
            fileType: file.type!,
            type,
            locale,
            organizationId,
          })

          // Store metadata for later confirmation
          file.meta.storagePath = path
          file.meta.assetId = assetId

          // Set upload URL to signed URL
          req.setEndpoint(signedUrl)
        } catch (error) {
          console.error('Error getting upload URL:', error)
          toast.error('Upload failed', {
            description: error instanceof Error ? error.message : 'Failed to get upload URL',
          })
          throw error
        }
      },
      async onAfterResponse(req, res, file) {
        // Upload completed successfully
        if (res.getStatus() === 200 || res.getStatus() === 201) {
          try {
            // Extract metadata (if available)
            const width = file.meta.width as number | undefined
            const height = file.meta.height as number | undefined
            const duration = file.meta.duration as number | undefined

            // Confirm upload and save to DB
            const asset = await confirmAssetUpload({
              assetId: file.meta.assetId as string,
              fileName: file.name,
              fileSize: file.size!,
              mimeType: file.type!,
              type,
              locale,
              storagePath: file.meta.storagePath as string,
              organizationId,
              width,
              height,
              duration,
            })

            handleUploadComplete(asset)
          } catch (error) {
            console.error('Error confirming upload:', error)
            toast.error('Upload failed', {
              description: error instanceof Error ? error.message : 'Failed to confirm upload',
            })
          }
        }
      },
    })

    uppyInstance.on('upload-success', (file) => {
      console.log('Upload success:', file?.name)
    })

    uppyInstance.on('upload-error', (file, error) => {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error?.message || 'An error occurred during upload',
      })
    })

    uppyInstance.on('restriction-failed', (file, error) => {
      toast.error('Upload restricted', {
        description: error?.message || 'File does not meet upload requirements',
      })
    })

    return uppyInstance
  })

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          <Upload />
          Upload {type}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Upload {type} {locale && `(${locale.toUpperCase()})`}
            </DialogTitle>
          </DialogHeader>

          <Dashboard
            uppy={uppy}
            proudlyDisplayPoweredByUppy={false}
            height={400}
            note={`Max file size: ${type === 'video' ? '500MB' : type === 'audio' ? '50MB' : '10MB'}`}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
