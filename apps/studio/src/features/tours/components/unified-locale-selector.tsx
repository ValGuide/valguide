import { useTranslations } from '@valguide/core/i18n/client'
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

const LOCALE_NATIVE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  rm: 'Rumantsch',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  ro: 'Română',
  bg: 'Български',
  hr: 'Hrvatski',
  sl: 'Slovenščina',
  uk: 'Українська',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
  he: 'עברית',
  tr: 'Türkçe',
  el: 'Ελληνικά',
  da: 'Dansk',
  sv: 'Svenska',
  no: 'Norsk',
  fi: 'Suomi',
  et: 'Eesti',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  ca: 'Català',
  eu: 'Euskara',
  gl: 'Galego',
  cy: 'Cymraeg',
  ga: 'Gaeilge',
  gd: 'Gàidhlig',
  mt: 'Malti',
  sq: 'Shqip',
  mk: 'Македонски',
  sr: 'Српски',
  bs: 'Bosanski',
  is: 'Íslenska',
  fo: 'Føroyskt',
  lb: 'Lëtzebuergesch',
  gsw: 'Schwyzerdütsch',
  bar: 'Boarisch',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  tl: 'Filipino',
  fa: 'فارسی',
  ur: 'اردو',
  ka: 'ქართული',
  hy: 'Հայերեն',
  mn: 'Монгол',
  ne: 'नेपाली',
  si: 'සිංහල',
  km: 'ខ្មែរ',
  lo: 'ລາວ',
  my: 'မြန်မာ',
  af: 'Afrikaans',
  ku: 'Kurdî',
  az: 'Azərbaycan',
  kk: 'Қазақ',
  uz: "O'zbek",
  ky: 'Кыргыз',
  tk: 'Türkmen',
  tg: 'Тоҷикӣ',
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

export function getLocaleNativeName(locale: string): string {
  return LOCALE_NATIVE_NAMES[locale] ?? getLocaleDisplayName(locale)
}

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
  const t = useTranslations('tours.localeSelector')
  const tManager = useTranslations('tours.localesManager')

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
              <span className="font-medium">{selectedLocaleName}</span>
              {showStatusInTrigger && selectedStatus && <StatusBadge status={selectedStatus} t={t} />}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-70 p-0" align="end">
          <Command defaultValue={selectedLocaleName}>
            <CommandInput placeholder={t('searchLanguages')} />
            <CommandList className="max-h-75">
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
                        <span>{localeName}</span>
                        <span className="text-xs text-muted-foreground">({locale})</span>
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

      <RemoveLocaleDialogUnified
        open={!!localeToRemove}
        onOpenChange={(open) => !open && setLocaleToRemove(null)}
        localeName={localeToRemove ? getLocaleDisplayName(localeToRemove) : ''}
        isLoading={isLoading}
        onConfirm={handleConfirmRemove}
      />
    </>
  )
}
