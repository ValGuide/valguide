import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { getLocalePresentation } from '@valguide/core/i18n/locale-display-names'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@valguide/ui/components/command'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { AVAILABLE_LANGUAGES } from './unified-locale-selector'

export type AddLanguageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingLocales: string[]
  onAddLanguage: (locale: string) => Promise<void>
}

export function AddLanguageDialog({ open, onOpenChange, existingLocales, onAddLanguage }: AddLanguageDialogProps) {
  const t = useTranslations('tours.localesManager')
  const displayLocale = useLocale()
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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent
        className="flex min-h-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-[400px]"
        data-testid="translations-add-language-dialog"
      >
        <ResponsiveDialogHeader className="px-4 pt-4 pb-3">
          <ResponsiveDialogTitle>{t('addLanguage')}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="sr-only">{t('searchLanguages')}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex min-h-0 flex-1 overflow-hidden px-0 py-0 sm:block sm:flex-none">
          <Command className="flex min-h-0 flex-1 border-none sm:block sm:flex-none">
            <CommandInput placeholder={t('searchLanguages')} disabled={isLoading} />
            <CommandList className="flex-1 max-h-none sm:max-h-[300px]">
              <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
              <CommandGroup>
                {availableLanguages.map((locale) => {
                  const { localizedName, nativeName, localeCode } = getLocalePresentation(locale, displayLocale)

                  return (
                    <CommandItem
                      key={locale}
                      value={`${nativeName} ${localizedName} ${localeCode}`}
                      onSelect={() => handleAddLocale(locale)}
                      disabled={isLoading}
                      className="flex items-center gap-2 py-2.5"
                      data-testid={`translations-add-language-option-${locale}`}
                    >
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium truncate">{nativeName}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {localizedName} ({localeCode})
                        </span>
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
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
