import { Avatar, AvatarFallback, AvatarImage } from '@valguide/ui/components/avatar'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Building2, Calendar, Check, MapPin, Pencil, Upload, Users, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { AdminOrgDetail } from '@/server/functions/get-org-detail.fn'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export type LogoFile = {
  base64: string
  mimeType: string
}

type OrgDetailHeaderProps = {
  org: AdminOrgDetail
  onNameUpdate: (name: string) => void
  isUpdatingName: boolean
  onLogoUpload: (logo: LogoFile) => void
  isUploadingLogo: boolean
  onLogoRemove: () => void
  isRemovingLogo: boolean
}

export function OrgDetailHeader({
  org,
  onNameUpdate,
  isUpdatingName,
  onLogoUpload,
  isUploadingLogo,
  onLogoRemove,
  isRemovingLogo,
}: OrgDetailHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(org.name)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStartEdit = () => {
    setEditName(org.name)
    setIsEditingName(true)
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setEditName(org.name)
  }

  const handleSaveName = () => {
    const trimmed = editName.trim()
    if (!trimmed || trimmed === org.name) {
      handleCancelEdit()
      return
    }
    onNameUpdate(trimmed)
    setIsEditingName(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_MIME_TYPES.includes(file.type)) return
    if (file.size > MAX_SIZE_BYTES) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      if (base64) {
        onLogoUpload({ base64, mimeType: file.type })
      }
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isLogoLoading = isUploadingLogo || isRemovingLogo

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="group relative">
          <Avatar className="size-16">
            {org.logo ? (
              <AvatarImage src={org.logo} alt={org.name} />
            ) : (
              <AvatarFallback>
                <Building2 className="size-6 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 w-64 text-lg font-bold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                disabled={isUpdatingName}
              />
              <Button variant="ghost" size="icon" className="size-7" onClick={handleSaveName} disabled={isUpdatingName}>
                <Check className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={handleCancelEdit}
                disabled={isUpdatingName}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{org.name}</h1>
              <Button variant="ghost" size="icon" className="size-7" onClick={handleStartEdit}>
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLogoLoading}
            >
              <Upload className="mr-1 size-3" />
              {isUploadingLogo ? 'Uploading...' : org.logo ? 'Change logo' : 'Upload logo'}
            </Button>
            {org.logo && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onLogoRemove} disabled={isLogoLoading}>
                {isRemovingLogo ? 'Removing...' : 'Remove'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <code className="rounded bg-muted px-2 py-0.5 text-xs">{org.nanoId}</code>

        <div className="flex items-center gap-1">
          <Users className="size-3.5" />
          <span>
            {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          <span>
            {org.tourCount} tour{org.tourCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
