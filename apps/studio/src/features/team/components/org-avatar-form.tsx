import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Avatar, AvatarFallback, AvatarImage } from '@valguide/ui/components/avatar'
import { Button } from '@valguide/ui/components/button'
import { Camera, X } from 'lucide-react'
import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

interface OrgAvatarFormProps {
  currentLogo: string | null
  orgName: string
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

export function OrgAvatarForm({ currentLogo, orgName, onUploadAndSave }: OrgAvatarFormProps) {
  const t = useTranslations('orgs.teamSettings')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const displayUrl = previewUrl ?? currentLogo

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
        className="group relative cursor-pointer rounded-lg"
        onClick={() => fileInputRef.current?.click()}
        disabled={isSaving}
      >
        <Avatar className="size-16 rounded-lg">
          {displayUrl && <AvatarImage src={displayUrl} alt={orgName} />}
          <AvatarFallback className="rounded-lg text-lg">{getInitials(orgName)}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
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

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{t('avatarLabel')}</p>
        <p className="text-xs text-muted-foreground">{t('avatarDescription')}</p>
        {selectedFile && (
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('avatarSaving') : t('avatarSave')}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
