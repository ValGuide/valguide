import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { RadioGroup, RadioGroupItem } from '@valguide/ui/components/radio-group'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface SaveThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingThemeId?: string
  existingThemeName?: string
  onSave: (name: string, saveAsNew: boolean) => Promise<void>
  isLoading: boolean
  error?: string | null
}

export function SaveThemeDialog({
  open,
  onOpenChange,
  existingThemeId,
  existingThemeName,
  onSave,
  isLoading,
  error,
}: SaveThemeDialogProps) {
  const t = useTranslations('studio.themeCustomizer.saveDialog')
  const [name, setName] = useState('')
  const [saveOption, setSaveOption] = useState<'new' | 'update'>('new')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(existingThemeName ?? '')
      setSaveOption(existingThemeId ? 'update' : 'new')
      setLocalError(null)
    }
  }, [open, existingThemeId, existingThemeName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setLocalError(t('nameRequired'))
      return
    }

    setLocalError(null)
    await onSave(trimmedName, saveOption === 'new')
  }

  const displayError = error ?? localError

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{t('title')}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="sr-only">{t('title')}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme-name">{t('name')}</Label>
                <Input
                  id="theme-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {existingThemeId && (
                <RadioGroup
                  value={saveOption}
                  onValueChange={(v) => setSaveOption(v as 'new' | 'update')}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="update" id="update" />
                    <Label htmlFor="update" className="font-normal cursor-pointer">
                      {t('updateExisting')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="font-normal cursor-pointer">
                      {t('saveAsNew')}
                    </Label>
                  </div>
                </RadioGroup>
              )}

              {displayError && <p className="text-sm text-destructive">{displayError}</p>}
            </div>
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {t('save')}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
