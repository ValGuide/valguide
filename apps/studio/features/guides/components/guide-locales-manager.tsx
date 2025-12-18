'use client'

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
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@valguide/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { Check, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { getLocaleDisplayName } from './locale-selector'

// TODO: unify with supportedLocales
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

export interface GuideLocalesManagerProps {
  value: string[]
  onChange: (locales: string[]) => Promise<void>
  hasContentForLocale?: (locale: string) => boolean
  disabled?: boolean
}

export function GuideLocalesManager({
  value,
  onChange,
  hasContentForLocale,
  disabled = false,
}: GuideLocalesManagerProps) {
  const t = useTranslations('guides.localesManager')
  const [open, setOpen] = useState(false)
  const [localeToRemove, setLocaleToRemove] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const availableToAdd = AVAILABLE_LANGUAGES.filter((lang) => !value.includes(lang))

  const handleAddLocale = async (locale: string) => {
    if (value.includes(locale)) return
    setIsLoading(true)
    try {
      await onChange([...value, locale])
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  const handleRemoveLocale = async (locale: string) => {
    if (value.length <= 1) return

    if (hasContentForLocale?.(locale)) {
      setLocaleToRemove(locale)
      return
    }

    await performRemove(locale)
  }

  const performRemove = async (locale: string) => {
    setIsLoading(true)
    try {
      await onChange(value.filter((l) => l !== locale))
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map((locale) => (
        <Badge key={locale} variant="secondary" className="gap-1 pr-1">
          <span>{getLocaleDisplayName(locale)}</span>
          <button
            type="button"
            onClick={() => handleRemoveLocale(locale)}
            disabled={disabled || isLoading || value.length <= 1}
            className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-30"
            aria-label={t('removeLanguage', { language: getLocaleDisplayName(locale) })}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || isLoading} className="h-7 gap-1">
            <Plus className="h-3 w-3" />
            {t('addLanguage')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command>
            <CommandInput placeholder={t('searchLanguages')} />
            <CommandList>
              <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
              <CommandGroup>
                {availableToAdd.map((locale) => {
                  const localeName = getLocaleDisplayName(locale)
                  const isSelected = value.includes(locale)
                  return (
                    <CommandItem
                      key={locale}
                      value={localeName}
                      onSelect={() => handleAddLocale(locale)}
                      className="flex items-center justify-between"
                    >
                      <span>{localeName}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog open={!!localeToRemove} onOpenChange={(open) => !open && setLocaleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemoveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemoveDescription', {
                language: localeToRemove ? getLocaleDisplayName(localeToRemove) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} disabled={isLoading}>
              {t('confirmRemove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
