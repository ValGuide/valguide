import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { getLocalePresentation } from '@valguide/core/i18n/locale-display-names'
import { Button } from '@valguide/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@valguide/ui/components/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { cn } from '@valguide/ui/lib/utils'
import { Check, ChevronDown, Globe, MoreHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { LocaleStatusMap, TranslationLocaleStatus } from '../utils/translation-status'
import { RemoveLocaleDialogUnified } from './remove-locale-dialog-unified'

export type { LocaleStatusMap, TranslationLocaleStatus }

export type ContentLocale = string

export const AVAILABLE_LANGUAGES = [
  'en',
  'de',
  'rm',
  'fr',
  'it',
  'es',
  'pt',
  'nl',
  'pl',
  'cs',
  'sk',
  'hu',
  'ro',
  'bg',
  'hr',
  'sl',
  'uk',
  'ru',
  'ja',
  'zh',
  'ko',
  'ar',
  'he',
  'tr',
  'el',
  'da',
  'sv',
  'no',
  'fi',
  'et',
  'lv',
  'lt',
  'ca',
  'eu',
  'gl',
  'cy',
  'ga',
  'gd',
  'mt',
  'sq',
  'mk',
  'sr',
  'bs',
  'is',
  'fo',
  'lb',
  'gsw',
  'bar',
  'als',
  'nds',
  'fy',
  'af',
  'yi',
  'id',
  'ms',
  'tl',
  'vi',
  'th',
  'my',
  'km',
  'lo',
  'hi',
  'bn',
  'ta',
  'te',
  'ml',
  'kn',
  'mr',
  'gu',
  'pa',
  'ur',
  'fa',
  'ps',
  'ku',
  'az',
  'ka',
  'hy',
  'mn',
  'ne',
  'si',
  'dz',
  'bo',
  'ug',
  'kk',
  'ky',
  'uz',
  'tk',
  'tg',
] as const

function StatusBadge({
  status,
  t,
}: {
  status: TranslationLocaleStatus
  t: ReturnType<typeof useTranslations<'tours.localeSelector'>>
}) {
  const baseClasses = 'rounded-full px-2 py-0.5 text-xs whitespace-nowrap'

  switch (status) {
    case 'published':
      return <span className={cn(baseClasses, 'bg-success text-success-foreground')}>{t('statusPublished')}</span>
    case 'draft':
      return (
        <span className={cn(baseClasses, 'border border-primary text-primary bg-transparent')}>{t('statusDraft')}</span>
      )
    case 'empty':
      return (
        <span className={cn(baseClasses, 'border border-muted-foreground/30 text-muted-foreground/50 bg-transparent')}>
          {t('statusEmpty')}
        </span>
      )
  }
}

export type UnifiedLocaleSelectorProps = {
  value: ContentLocale
  locales: ContentLocale[]
  onValueChange: (locale: ContentLocale) => void
  localeStatus?: LocaleStatusMap
  className?: string
  onAddLocale?: (locale: string) => Promise<void>
  onRemoveLocale?: (locale: string) => Promise<void>
  hasContentForLocale?: (locale: string) => boolean
  /** Whether to show status badge in the trigger button. Default: true */
  showStatusInTrigger?: boolean
}

export function UnifiedLocaleSelector({
  value,
  locales,
  onValueChange,
  localeStatus,
  className,
  onAddLocale,
  onRemoveLocale,
  hasContentForLocale,
  showStatusInTrigger = true,
}: UnifiedLocaleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localeToRemove, setLocaleToRemove] = useState<string | null>(null)
  const displayLocale = useLocale()
  const t = useTranslations('tours.localeSelector')
  const tManager = useTranslations('tours.localesManager')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const selectedLocalePresentation = getLocalePresentation(value, displayLocale)
  const selectedLocaleName = selectedLocalePresentation.localizedName
  const selectedLocaleSearchValue = `${selectedLocalePresentation.nativeName} ${selectedLocalePresentation.localizedName} ${selectedLocalePresentation.localeCode}`
  const selectedStatus = localeStatus?.[value]
  const availableToAdd = AVAILABLE_LANGUAGES.filter((lang) => !locales.includes(lang))
  const canRemove = locales.length > 1

  const handleAddLocale = async (locale: string) => {
    if (!onAddLocale || locales.includes(locale)) return
    setIsLoading(true)
    try {
      await onAddLocale(locale)
      onValueChange(locale)
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  const handleRemoveClick = (locale: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canRemove) return

    if (hasContentForLocale?.(locale)) {
      setLocaleToRemove(locale)
    } else {
      performRemove(locale)
    }
  }

  const performRemove = async (locale: string) => {
    if (!onRemoveLocale) return
    setIsLoading(true)
    try {
      await onRemoveLocale(locale)
      if (value === locale && locales.length > 1) {
        const remaining = locales.filter((l) => l !== locale)
        const nextLocale = remaining[0]
        if (nextLocale) {
          onValueChange(nextLocale)
        }
      }
    } finally {
      setIsLoading(false)
      setLocaleToRemove(null)
    }
  }

  const handleConfirmRemove = async () => {
    if (localeToRemove) {
      await performRemove(localeToRemove)
    }
  }

  if (!isMounted) {
    return (
      <Button variant="outline" disabled className={cn('h-9 justify-between gap-2', className)}>
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {selectedLocaleName}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={t('selectLanguage')}
            disabled={isLoading}
            className={cn('h-9 justify-between gap-2', className)}
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedLocaleName}</span>
              {showStatusInTrigger && selectedStatus && <StatusBadge status={selectedStatus} t={t} />}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-70 p-0" align="end">
          <Command defaultValue={selectedLocaleSearchValue}>
            <CommandInput placeholder={t('searchLanguages')} />
            <CommandList className="max-h-75">
              <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>

              <CommandGroup heading={t('enabledLanguages')}>
                {locales.map((locale) => {
                  const { localizedName, nativeName, localeCode } = getLocalePresentation(locale, displayLocale)
                  const status = localeStatus?.[locale]
                  const isSelected = value === locale

                  return (
                    <CommandItem
                      key={locale}
                      value={`${nativeName} ${localizedName} ${localeCode}`}
                      onSelect={() => {
                        onValueChange(locale)
                        setOpen(false)
                      }}
                      className="flex items-center justify-between pr-1"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{nativeName}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {localizedName} ({localeCode})
                          </span>
                        </span>
                        {status && <StatusBadge status={status} t={t} />}
                      </span>
                      <span className="flex items-center gap-1">
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                        {onRemoveLocale && canRemove && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-50 hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => handleRemoveClick(locale, e)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {tManager('removeLanguage', { language: localizedName })}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>

              {onAddLocale && availableToAdd.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t('addLanguage')}>
                    {availableToAdd.map((locale) => {
                      const { localizedName, nativeName, localeCode } = getLocalePresentation(locale, displayLocale)
                      return (
                        <CommandItem
                          key={locale}
                          value={`${nativeName} ${localizedName} ${localeCode}`}
                          onSelect={() => handleAddLocale(locale)}
                          className="flex items-center gap-2 py-2.5"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{nativeName}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {localizedName} ({localeCode})
                            </span>
                          </span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <RemoveLocaleDialogUnified
        open={!!localeToRemove}
        onOpenChange={(open) => !open && setLocaleToRemove(null)}
        localeName={localeToRemove ? getLocalePresentation(localeToRemove, displayLocale).localizedName : ''}
        isLoading={isLoading}
        onConfirm={handleConfirmRemove}
      />
    </>
  )
}
