'use client'

import { useState, useCallback, useMemo } from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import Dashboard from '@uppy/react/dashboard'
import {
  getUploadSignedUrl,
  confirmAssetUpload,
  type AssetType,
} from '@valguide/core/features/assets/actions'
import { validateFileSize, getAllowedMimeTypes } from '@valguide/core/features/assets/utils'
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

  const uppy = useMemo(() => {
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
      async onBeforeRequest(req: any) {
        const file = uppyInstance.getFile(req.getURL().split('/').pop() || '')
        try {
          // Validate file size
          if (file && !validateFileSize(file.size!, type)) {
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
          if (file) {
            uppyInstance.setFileMeta(file.id, {
              storagePath: path,
              assetId: assetId,
            })
          }

          // Update endpoint to use signed URL
          req._opts.endpoint = signedUrl
        } catch (error) {
          console.error('Error getting upload URL:', error)
          toast.error('Upload failed', {
            description: error instanceof Error ? error.message : 'Failed to get upload URL',
          })
          throw error
        }
      },
    })

    uppyInstance.on('upload-success', (file) => {
      console.log('Upload success:', file?.name)
      if (file) {
        // Extract metadata (if available)
        const width = file.meta.width as number | undefined
        const height = file.meta.height as number | undefined
        const duration = file.meta.duration as number | undefined

        // Confirm upload and save to DB
        confirmAssetUpload({
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
          .then((asset) => {
            if (asset) {
              handleUploadComplete(asset)
            }
          })
          .catch((error) => {
            console.error('Error confirming upload:', error)
            toast.error('Upload failed', {
              description: error instanceof Error ? error.message : 'Failed to confirm upload',
            })
          })
      }
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
  }, [type, locale, organizationId, handleUploadComplete])

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
