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
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { AVAILABLE_LANGUAGES, getLocaleDisplayName, getLocaleNativeName } from './unified-locale-selector'

export type AddLanguageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingLocales: string[]
  onAddLanguage: (locale: string) => Promise<void>
}

export function AddLanguageDialog({ open, onOpenChange, existingLocales, onAddLanguage }: AddLanguageDialogProps) {
  const t = useTranslations('tours.localesManager')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingLocale, setLoadingLocale] = useState<string | null>(null)

  const availableLanguages = AVAILABLE_LANGUAGES.filter((lang) => !existingLocales.includes(lang))

  const handleAddLocale = async (locale: string) => {
    setIsLoading(true)
    setLoadingLocale(locale)
    try {
      await onAddLanguage(locale)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
      setLoadingLocale(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle>{t('addLanguage')}</DialogTitle>
          <DialogDescription className="sr-only">{t('searchLanguages')}</DialogDescription>
        </DialogHeader>
        <Command className="border-none">
          <CommandInput placeholder={t('searchLanguages')} disabled={isLoading} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
            <CommandGroup>
              {availableLanguages.map((locale) => {
                const nativeName = getLocaleNativeName(locale)
                const englishName = getLocaleDisplayName(locale)
                const showEnglishName = nativeName !== englishName

                return (
                  <CommandItem
                    key={locale}
                    value={`${nativeName} ${englishName} ${locale}`}
                    onSelect={() => handleAddLocale(locale)}
                    disabled={isLoading}
                    className="flex items-center gap-2 py-2.5"
                  >
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium truncate">{nativeName}</span>
                      {showEnglishName && (
                        <span className="text-xs text-muted-foreground truncate">
                          {englishName} ({locale})
                        </span>
                      )}
                      {!showEnglishName && <span className="text-xs text-muted-foreground">({locale})</span>}
                    </span>
                    {loadingLocale === locale && (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
                    )}
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
