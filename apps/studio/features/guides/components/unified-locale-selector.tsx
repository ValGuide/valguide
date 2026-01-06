
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@valguide/ui/components/alert-dialog'
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
import { Check, ChevronDown, Circle, Globe, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { useEffect, useState } from 'react'
import type { LocaleStatusMap, TranslationLocaleStatus } from '../utils/translation-status'

export type { LocaleStatusMap, TranslationLocaleStatus }

export type ContentLocale = string

const AVAILABLE_LANGUAGES = [
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

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  rm: 'Romansh',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sl: 'Slovenian',
  uk: 'Ukrainian',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  he: 'Hebrew',
  tr: 'Turkish',
  el: 'Greek',
  da: 'Danish',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
}

export function getLocaleDisplayName(locale: string): string {
  if (LOCALE_NAMES[locale]) return LOCALE_NAMES[locale]

  if (typeof window !== 'undefined' && 'DisplayNames' in Intl) {
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'language' })
      const name = dn.of(locale)
      if (name) return name
    } catch {
      // ignore
    }
  }

  return locale.toUpperCase()
}

function getStatusIcon(status: TranslationLocaleStatus) {
  switch (status) {
    case 'published':
      return <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
    case 'draft':
      return <Circle className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
    case 'empty':
      return <Circle className="h-2.5 w-2.5 fill-muted-foreground/30 text-muted-foreground/30" />
  }
}

function getStatusLabel(
  status: TranslationLocaleStatus,
  t: ReturnType<typeof useTranslations<'guides.localeSelector'>>,
) {
  switch (status) {
    case 'published':
      return t('statusPublished')
    case 'draft':
      return t('statusDraft')
    case 'empty':
      return t('statusEmpty')
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
}: UnifiedLocaleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localeToRemove, setLocaleToRemove] = useState<string | null>(null)
  const t = useTranslations('guides.localeSelector')
  const tManager = useTranslations('guides.localesManager')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const selectedLocaleName = getLocaleDisplayName(value)
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
              {selectedStatus && getStatusIcon(selectedStatus)}
              <span className="font-medium">{selectedLocaleName}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="end">
          <Command>
            <CommandInput placeholder={t('searchLanguages')} />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>

              <CommandGroup heading={t('enabledLanguages')}>
                {locales.map((locale) => {
                  const localeName = getLocaleDisplayName(locale)
                  const status = localeStatus?.[locale]
                  const isSelected = value === locale

                  return (
                    <CommandItem
                      key={locale}
                      value={localeName}
                      onSelect={() => {
                        onValueChange(locale)
                        setOpen(false)
                      }}
                      className="flex items-center justify-between pr-1"
                    >
                      <span className="flex items-center gap-2">
                        {status && getStatusIcon(status)}
                        <span>{localeName}</span>
                        {status && <span className="text-xs text-muted-foreground">({getStatusLabel(status, t)})</span>}
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
                                {tManager('removeLanguage', { language: localeName })}
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
                      const localeName = getLocaleDisplayName(locale)
                      return (
                        <CommandItem
                          key={locale}
                          value={localeName}
                          onSelect={() => handleAddLocale(locale)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4 text-muted-foreground" />
                          <span>{localeName}</span>
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

      <AlertDialog open={!!localeToRemove} onOpenChange={(open) => !open && setLocaleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tManager('confirmRemoveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tManager('confirmRemoveDescription', {
                language: localeToRemove ? getLocaleDisplayName(localeToRemove) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{tManager('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tManager('confirmRemove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
