import { formatFileSize } from '@valguide/core/features/assets/utils'
import { cn } from '@valguide/ui/lib/utils'
import { CheckCircle2, FileIcon, Upload, X } from 'lucide-react'
import * as React from 'react'

export interface FileDropzoneProps {
  onFilesSelected?: (files: File[]) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
  className?: string
  disabled?: boolean
  translations?: {
    dragAndDrop: string
    orClickToBrowse: string
    dropFilesHere: string
    maxFileSize: string
    upTo: string
    files: string
    filesSelected: string
    clearAll: string
    complete: string
    fileSizeExceeds: string
    limit: string
    fileTypeNotAccepted: string
  }
}

interface UploadedFile {
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

const defaultTranslations = {
  dragAndDrop: 'Drag and drop files here',
  orClickToBrowse: 'or click to browse',
  dropFilesHere: 'Drop files here',
  maxFileSize: 'Max file size',
  upTo: 'Up to',
  files: 'files',
  filesSelected: 'selected',
  clearAll: 'Clear all',
  complete: 'Complete',
  fileSizeExceeds: 'File size exceeds',
  limit: 'limit',
  fileTypeNotAccepted: 'File type not accepted',
}

export function FileDropzone({
  onFilesSelected,
  acceptedFileTypes = ['*'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 10,
  className,
  disabled = false,
  translations = defaultTranslations,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const t = { ...defaultTranslations, ...translations }

  const validateFile = React.useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `${t.fileSizeExceeds} ${(maxFileSize / 1024 / 1024).toFixed(2)}MB ${t.limit}`
      }

      if (acceptedFileTypes[0] !== '*') {
        const isAccepted = acceptedFileTypes.some((type) => {
          if (type.endsWith('/*')) {
            const mimePrefix = type.split('/')[0]
            return mimePrefix ? file.type.startsWith(mimePrefix) : false
          }
          if (type.startsWith('.')) {
            return file.name.endsWith(type)
          }
          return file.type === type
        })

        if (!isAccepted) {
          return t.fileTypeNotAccepted
        }
      }

      return null
    },
    [maxFileSize, acceptedFileTypes, t],
  )

  const processFiles = React.useCallback(
    (files: File[]) => {
      const newFiles: UploadedFile[] = []

      for (const file of files) {
        if (uploadedFiles.length + newFiles.length >= maxFiles) {
          break
        }

        const error = validateFile(file)

        if (error) {
          newFiles.push({
            file,
            preview: '',
            progress: 0,
            status: 'error',
            error,
          })
        } else {
          newFiles.push({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'pending',
          })
        }
      }

      setUploadedFiles((prev) => [...prev, ...newFiles])

      const validFiles = newFiles.filter((f) => f.status !== 'error').map((f) => f.file)

      if (validFiles.length > 0) {
        onFilesSelected?.(validFiles)
      }
    },
    [uploadedFiles, maxFiles, onFilesSelected, validateFile],
  )

  const handleDrag = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
      }
    },
    [disabled],
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    },
    [disabled, processFiles],
  )

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.currentTarget.files || [])
      processFiles(files)
      // Reset input value so the same file can be selected again
      e.currentTarget.value = ''
    },
    [processFiles],
  )

  const removeFile = React.useCallback((index: number) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev[index]
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const clearAll = React.useCallback(() => {
    uploadedFiles.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview)
      }
    })
    setUploadedFiles([])
  }, [uploadedFiles])

  const getFileIcon = React.useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      return 'image'
    }
    return 'document'
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview)
        }
      })
    }
  }, [uploadedFiles.forEach])

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Dropzone Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors duration-200 p-8 md:p-12 text-center',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          (isDragActive || isHovered) && !disabled ? 'border-primary bg-accent' : 'border-border bg-background',
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          onChange={handleChange}
          accept={acceptedFileTypes.join(',')}
          className="hidden"
          aria-label="File upload input"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3">
          <Upload
            className={cn(
              'w-10 h-10 transition-colors duration-200',
              (isDragActive || isHovered) && !disabled ? 'text-primary' : 'text-muted-foreground',
            )}
          />

          <div>
            <p className="text-lg font-semibold text-foreground">{isDragActive ? t.dropFilesHere : t.dragAndDrop}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.orClickToBrowse}</p>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {t.maxFileSize}: {(maxFileSize / 1024 / 1024).toFixed(0)}MB • {t.upTo} {maxFiles} {t.files}
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {uploadedFiles.length} {uploadedFiles.length !== 1 ? t.files : t.files.slice(0, -1)} {t.filesSelected}
            </h3>
            {uploadedFiles.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                {t.clearAll}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={`${uploadedFile.file.name}-${index}`}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border group hover:bg-muted transition-colors"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {uploadedFile.status === 'error' ? (
                    <div className="w-10 h-10 rounded bg-destructive/10 flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-destructive" />
                    </div>
                  ) : getFileIcon(uploadedFile.file) === 'image' ? (
                    // biome-ignore lint/performance/noImgElement: Using img for dynamic content
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{uploadedFile.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.file.size)}</p>
                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <p className="text-xs text-destructive">{uploadedFile.error}</p>
                    )}
                    {uploadedFile.status === 'complete' && (
                      <p className="text-xs text-green-600 dark:text-green-400">{t.complete}</p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadedFile.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : uploadedFile.status === 'error' ? (
                    <X className="w-5 h-5 text-destructive" />
                  ) : null}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1.5 hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Remove file"
                  type="button"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
