import { ORG_ROLES, type OrgRole } from '@valguide/core/features/orgs/schema'
import { valguideId } from '@valguide/core/utils/nanoid'
import { generateSlug } from '@valguide/core/utils/slug'
import { Avatar, AvatarFallback, AvatarImage } from '@valguide/ui/components/avatar'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Building2, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

type MemberRow = { id: string; email: string; role: OrgRole }

export type LogoFile = {
  base64: string
  mimeType: string
}

export type CreateOrgInput = {
  name: string
  slug?: string
  members?: { email: string; role: OrgRole }[]
  logo?: LogoFile
}

type CreateOrgDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isCreating: boolean
  onConfirm: (input: CreateOrgInput) => void
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export function CreateOrgDialog({ open, onOpenChange, isCreating, onConfirm }: CreateOrgDialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [logoFile, setLogoFile] = useState<LogoFile | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const slugPreview = name && !slug ? generateSlug(name) : null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_MIME_TYPES.includes(file.type)) return
    if (file.size > MAX_SIZE_BYTES) return

    setLogoPreview(URL.createObjectURL(file))

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      if (base64) {
        setLogoFile({ base64, mimeType: file.type })
      }
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
      setLogoPreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConfirm = () => {
    if (!name.trim()) return
    onConfirm({
      name: name.trim(),
      slug: slug.trim() || undefined,
      members: members.filter((m) => m.email.trim()).map((m) => ({ email: m.email.trim(), role: m.role })),
      logo: logoFile ?? undefined,
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('')
      setSlug('')
      setMembers([])
      removeLogo()
    }
    onOpenChange(nextOpen)
  }

  const addMemberRow = () => {
    setMembers([...members, { id: valguideId(), email: '', role: 'editor' }])
  }

  const updateMember = (index: number, updates: Partial<MemberRow>) => {
    setMembers(members.map((m, i) => (i === index ? { ...m, ...updates } : m)))
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange} mobileVariant="full-height">
      <ResponsiveDialogContent className="flex min-h-0 flex-col p-0 sm:max-h-[90vh] sm:max-w-lg sm:p-6">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create Organization</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Create a new organization and optionally add initial members.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {logoPreview ? (
                <AvatarImage src={logoPreview} alt="Organization logo" />
              ) : (
                <AvatarFallback>
                  <Building2 className="size-6 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-1 size-3" />
                  {logoPreview ? 'Change' : 'Upload logo'}
                </Button>
                {logoPreview && (
                  <Button type="button" variant="ghost" size="sm" onClick={removeLogo}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, WebP, or GIF. Max 5MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-name">Name *</Label>
            <Input id="org-name" placeholder="My Museum" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              placeholder="Leave empty to auto-generate"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            {slugPreview && (
              <p className="text-xs text-muted-foreground">
                Auto-generated: <span className="font-mono">{slugPreview}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Members</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMemberRow}>
                <Plus className="mr-1 size-3" />
                Add member
              </Button>
            </div>

            {members.map((member, index) => (
              <div key={member.id} className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={member.email}
                  onChange={(e) => updateMember(index, { email: e.target.value })}
                  className="flex-1"
                />
                <Select value={member.role} onValueChange={(role: OrgRole) => updateMember(index, { role })}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(index)}
                  className="shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {members.length === 0 && (
              <p className="text-xs text-muted-foreground">No members. You can add them later.</p>
            )}
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isCreating || !name.trim()}>
            {isCreating ? 'Creating...' : 'Create Organization'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
