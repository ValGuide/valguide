'use client'

import { useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@valguide/ui/components/button'
import { Progress } from '@valguide/ui/components/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Upload, X, FileIcon, ImageIcon, Music, Video, CheckCircle2 } from 'lucide-react'
import { cn } from '@valguide/ui/lib/utils'
import { toast } from 'sonner'
import { uploadFileWithTUS } from '../lib/tus-upload'
import { confirmAssetUpload, type AssetType } from '@valguide/core/features/assets/actions'
import { getAllowedMimeTypes, validateFileSize } from '@valguide/core/features/assets/utils'
import type { Asset } from '@valguide/core/features/assets/schema'
import { nanoid } from 'nanoid'

export type CustomAssetUploadProps = {
  type: AssetType
  locale?: string
  organizationId: string
  onUploadComplete?: (asset: Asset) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CustomAssetUpload({
  type,
  locale,
  organizationId,
  onUploadComplete,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CustomAssetUploadProps) {
  const t = useTranslations('assets')
  const [internalOpen, setInternalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = controlledOnOpenChange || setInternalOpen

  const maxSizeMB = type === 'video' ? 500 : type === 'audio' ? 50 : 10
  const allowedTypes = getAllowedMimeTypes(type)

  const getTypeIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-10 w-10 text-muted-foreground" />
      case 'audio':
        return <Music className="h-10 w-10 text-muted-foreground" />
      case 'video':
        return <Video className="h-10 w-10 text-muted-foreground" />
      default:
        return <FileIcon className="h-10 w-10 text-muted-foreground" />
    }
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (!selectedFile) return

      // Validate file type
      if (!allowedTypes.includes(selectedFile.type)) {
        setError(`Invalid file type. Please select a ${type} file.`)
        return
      }

      // Validate file size
      if (!validateFileSize(selectedFile.size, type)) {
        setError(`File size exceeds ${maxSizeMB}MB limit`)
        return
      }

      setFile(selectedFile)
      setError(null)
      setUploadComplete(false)
    },
    [allowedTypes, maxSizeMB, type]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files?.[0]
      if (!droppedFile) return

      // Validate file type
      if (!allowedTypes.includes(droppedFile.type)) {
        setError(`Invalid file type. Please select a ${type} file.`)
        return
      }

      // Validate file size
      if (!validateFileSize(droppedFile.size, type)) {
        setError(`File size exceeds ${maxSizeMB}MB limit`)
        return
      }

      setFile(droppedFile)
      setError(null)
      setUploadComplete(false)
    },
    [allowedTypes, maxSizeMB, type]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const assetId = nanoid()
      const timestamp = Date.now()
      const fileName = `${organizationId}/${type}/${timestamp}-${file.name}`

      // Upload file with TUS
      await uploadFileWithTUS({
        bucketName: 'assets',
        fileName,
        file,
        onProgress: setProgress,
        onError: (err) => setError(err.message),
      })

      // Confirm upload and save to database
      const asset = await confirmAssetUpload({
        assetId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        type,
        locale,
        storagePath: fileName,
        organizationId,
      })

      if (asset) {
        setUploadComplete(true)
        toast.success(t('upload.success'), {
          description: `${file.name} uploaded successfully`,
        })
        onUploadComplete?.(asset)

        // Reset after a short delay
        setTimeout(() => {
          setFile(null)
          setProgress(0)
          setUploadComplete(false)
          setIsOpen(false)
        }, 1500)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      toast.error(t('upload.error'), {
        description: errorMessage,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setProgress(0)
    setError(null)
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {controlledOpen === undefined && (
        <Button onClick={() => setIsOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload {type}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Upload {type} {locale && `(${locale.toUpperCase()})`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-6 sm:p-12 transition-all',
                uploadComplete
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : file
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50',
                uploading && 'pointer-events-none opacity-60'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileChange}
                disabled={uploading || uploadComplete}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
                {uploadComplete ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" />
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400">
                        Upload Complete!
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[250px] sm:max-w-none">
                        {file?.name}
                      </p>
                    </div>
                  </>
                ) : file ? (
                  <>
                    {getTypeIcon()}
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium truncate max-w-[250px] sm:max-w-none">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {getTypeIcon()}
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base font-medium">Drop {type} here or click to browse</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Maximum size: {maxSizeMB}MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress.toFixed(1)}% uploaded
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5">
                <p className="text-sm font-medium text-destructive">Upload failed</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{error}</p>
              </div>
            )}

            {/* Actions */}
            {file && !uploading && !uploadComplete && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleUpload} className="flex-1" size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Upload {type}</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
