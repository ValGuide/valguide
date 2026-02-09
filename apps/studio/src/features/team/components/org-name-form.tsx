import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { useState } from 'react'

interface OrgNameFormProps {
  organizationId: string
  currentName: string
  onUpdateName: (organizationId: string, newName: string) => Promise<void>
}

export function OrgNameForm({ organizationId, currentName, onUpdateName }: OrgNameFormProps) {
  const t = useTranslations('orgs.teamSettings')
  const [name, setName] = useState(currentName)
  const [isSaving, setIsSaving] = useState(false)

  const hasChanged = name.trim() !== currentName
  const isValid = name.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanged || !isValid) return

    setIsSaving(true)
    try {
      await onUpdateName(organizationId, name.trim())
      toast.success(t('nameSaveSuccess'))
    } catch {
      toast.error(t('nameSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="grid flex-1 gap-2">
        <Label htmlFor="org-name">{t('nameLabel')}</Label>
        <Input
          id="org-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          disabled={isSaving}
          maxLength={255}
        />
      </div>
      <Button type="submit" disabled={!hasChanged || !isValid || isSaving}>
        {isSaving ? t('nameSaving') : t('nameSave')}
      </Button>
    </form>
  )
}
