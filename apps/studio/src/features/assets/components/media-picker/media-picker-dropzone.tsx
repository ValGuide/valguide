import type { AssetType } from '@valguide/core/features/assets/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { Image as ImageIcon, Music, Upload, Video } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

export type MediaPickerDropzoneProps = {
  onFileSelect: (file: File) => void
  acceptedMimeTypes: string[]
  disabled?: boolean
  mediaTypes: AssetType[]
}

export function MediaPickerDropzone({
  onFileSelect,
  acceptedMimeTypes,
  disabled = false,
  mediaTypes,
}: MediaPickerDropzoneProps) {
  const t = useTranslations('assets.mediaPicker')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        onFileSelect(droppedFile)
      }
    },
    [disabled, onFileSelect],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        fileInputRef.current?.click()
      }
    },
    [disabled],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFileSelect],
  )

  const getIcon = () => {
    if (mediaTypes.length === 1) {
      switch (mediaTypes[0]) {
        case 'image':
          return <ImageIcon className="h-10 w-10 text-muted-foreground" />
        case 'audio':
          return <Music className="h-10 w-10 text-muted-foreground" />
        case 'video':
          return <Video className="h-10 w-10 text-muted-foreground" />
      }
    }
    return <Upload className="h-10 w-10 text-muted-foreground" />
  }

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: button cannot support drag/drop events properly */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label={t('dropzoneAriaLabel')}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedMimeTypes.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
        />

        <div className="flex flex-col items-center text-center space-y-3">
          {getIcon()}

          {isDragging ? (
            <p className="text-sm font-medium text-primary">{t('dropHere')}</p>
          ) : (
            <>
              <p className="hidden text-sm font-medium sm:block">{t('dropzoneDesktop')}</p>
              <p className="text-sm font-medium sm:hidden">{t('dropzoneMobile')}</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
