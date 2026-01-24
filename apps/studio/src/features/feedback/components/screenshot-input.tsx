import { formatFileSize } from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export interface ScreenshotInputProps {
  onFileSelect: (file: File | null) => void
  disabled?: boolean
  uploadProgress?: number
  isUploading?: boolean
  /** External error from upload failure (shown instead of validation error) */
  uploadError?: string | null
  /** Called when user clears the upload error to retry */
  onClearError?: () => void
}

export function ScreenshotInput({
  onFileSelect,
  disabled = false,
  uploadProgress = 0,
  isUploading = false,
  uploadError = null,
  onClearError,
}: ScreenshotInputProps) {
  const t = useTranslations('sidebar.feedback.screenshot')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup preview URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return t('invalidType')
      }
      if (file.size > MAX_FILE_SIZE) {
        return t('fileTooLarge')
      }
      return null
    },
    [t],
  )

  const handleFileSelect = useCallback(
    (file: File | null) => {
      // Clear previous state
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      setError(null)

      if (!file) {
        setSelectedFile(null)
        setPreview(null)
        onFileSelect(null)
        return
      }

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setSelectedFile(null)
        setPreview(null)
        onFileSelect(null)
        return
      }

      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      onFileSelect(file)
    },
    [preview, validateFile, onFileSelect],
  )

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
      }
    },
    [disabled],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((f) => f.type.startsWith('image/'))
      if (imageFile) {
        handleFileSelect(imageFile)
      }
    },
    [disabled, handleFileSelect],
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (disabled) return

      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleFileSelect(file)
            break
          }
        }
      }
    },
    [disabled, handleFileSelect],
  )

  // Listen for paste events
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0] ?? null
      handleFileSelect(file)
      // Reset input value so the same file can be selected again
      e.currentTarget.value = ''
    },
    [handleFileSelect],
  )

  const handleClear = useCallback(() => {
    handleFileSelect(null)
    onClearError?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect, onClearError])

  const isDisabled = disabled || isUploading

  // Show preview if file selected
  if (selectedFile && preview) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <img src={preview} alt={t('uploadLabel')} className="h-16 w-16 rounded-md object-cover" />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>

              {/* Progress bar */}
              {isUploading && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Clear button */}
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 flex-shrink-0"
                onClick={handleClear}
                disabled={isDisabled}
              >
                <X className="size-4" />
                <span className="sr-only">{t('remove')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Empty state - dropzone
  return (
    <div className="space-y-2">
      {/* biome-ignore lint/a11y/useSemanticElements: Dropzone requires div for drag-drop + click + keyboard */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors',
          isDisabled && 'cursor-not-allowed opacity-50',
          isDragActive ? 'border-primary bg-accent' : 'border-border hover:border-primary hover:bg-accent/50',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={isDisabled}
          aria-label={t('uploadLabel')}
        />

        <div className="flex items-center gap-2 text-muted-foreground">
          {isDragActive ? <ImageIcon className="size-5" /> : <Upload className="size-5" />}
          <span className="text-sm">{isDragActive ? t('dropHere') : t('addScreenshot')}</span>
        </div>

        <p className="text-xs text-muted-foreground">{t('pasteOrDrag')}</p>
      </div>

      {/* Show upload error (external) or validation error (internal) */}
      {(uploadError ?? error) && <p className="text-sm text-destructive">{uploadError ?? error}</p>}
    </div>
  )
}
