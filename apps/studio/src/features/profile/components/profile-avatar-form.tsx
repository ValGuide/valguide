import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Avatar, AvatarFallback, AvatarImage } from '@valguide/ui/components/avatar'
import { Button } from '@valguide/ui/components/button'
import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

interface ProfileAvatarFormProps {
  currentAvatarUrl: string | null
  displayName: string
  onUploadAndSave: (file: File) => Promise<void>
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileAvatarForm({ currentAvatarUrl, displayName, onUploadAndSave }: ProfileAvatarFormProps) {
  const t = useTranslations('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const displayUrl = previewUrl ?? currentAvatarUrl

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t('avatarInvalidType'))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('avatarTooLarge'))
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSave = async () => {
    if (!selectedFile) return
    setIsSaving(true)
    try {
      await onUploadAndSave(selectedFile)
      toast.success(t('avatarSaveSuccess'))
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch {
      toast.error(t('avatarSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="group relative cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        disabled={isSaving}
      >
        <Avatar className="size-16">
          {displayUrl && <AvatarImage src={displayUrl} alt={displayName} />}
          <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5 text-white" />
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />

      {selectedFile ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{t('avatarLabel')}</p>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('avatarSaving') : t('avatarSave')}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <button type="button" className="flex flex-col gap-0.5 text-left" onClick={() => fileInputRef.current?.click()}>
          <p className="text-sm font-medium">{t('avatarLabel')}</p>
          <p className="text-xs text-muted-foreground">{t('avatarClickToUpload')}</p>
        </button>
      )}
    </div>
  )
}
