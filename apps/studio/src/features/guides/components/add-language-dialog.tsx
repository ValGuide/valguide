import { useTranslations } from '@valguide/core/i18n/client'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@valguide/ui/components/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AVAILABLE_LANGUAGES, getLocaleDisplayName } from './unified-locale-selector'

export type AddLanguageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingLocales: string[]
  onAddLanguage: (locale: string) => Promise<void>
}

export function AddLanguageDialog({ open, onOpenChange, existingLocales, onAddLanguage }: AddLanguageDialogProps) {
  const t = useTranslations('guides.localesManager')
  const [isLoading, setIsLoading] = useState(false)

  const availableLanguages = AVAILABLE_LANGUAGES.filter((lang) => !existingLocales.includes(lang))

  const handleAddLocale = async (locale: string) => {
    setIsLoading(true)
    try {
      await onAddLanguage(locale)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('addLanguage')}</DialogTitle>
          <DialogDescription className="sr-only">{t('searchLanguages')}</DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border">
          <CommandInput placeholder={t('searchLanguages')} disabled={isLoading} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
            <CommandGroup>
              {availableLanguages.map((locale) => {
                const localeName = getLocaleDisplayName(locale)
                return (
                  <CommandItem
                    key={locale}
                    value={localeName}
                    onSelect={() => handleAddLocale(locale)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span>{localeName}</span>
                    <span className="text-xs text-muted-foreground">({locale})</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
