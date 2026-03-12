import { useTranslations } from '@valguide/core/i18n/client'
import { getLocaleDisplayName as getSharedLocaleDisplayName } from '@valguide/core/i18n/locale-display-names'
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
import { cn } from '@valguide/ui/lib/utils'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

export type ContentLocale = string

export type LocaleSelectorProps = {
  value: ContentLocale
  locales: ContentLocale[]
  onValueChange: (locale: ContentLocale) => void
  className?: string
  footer?: ReactNode
}

const SEARCH_THRESHOLD = 8

function isTextKey(e: React.KeyboardEvent) {
  if (e.key.length !== 1) return false
  if (e.ctrlKey || e.metaKey || e.altKey) return false
  return true
}

export function LocaleSelector({ value, locales, onValueChange, className, footer }: LocaleSelectorProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('tours.localeSelector')
  const selectedLocaleName = getSharedLocaleDisplayName(value)
  const showSearch = locales.length >= SEARCH_THRESHOLD

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [active, setActive] = useState<ContentLocale>(value)

  useEffect(() => setActive(value), [value])

  useEffect(() => {
    if (!open) return
    setActive(getSharedLocaleDisplayName(value))
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t('selectLanguage')}
          className={cn('w-50 justify-between', className)}
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {selectedLocaleName}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-62.5 p-0" align="start">
        <Command
          value={active}
          onValueChange={setActive}
          className={cn(!showSearch && '**:data-[slot=command-input-wrapper]:sr-only')}
          onKeyDownCapture={(e) => {
            if (!showSearch && isTextKey(e)) {
              e.preventDefault()
              e.stopPropagation()
            }
            if (!showSearch && (e.key === 'Backspace' || e.key === 'Delete')) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
          <CommandInput aria-hidden={!showSearch} placeholder={t('searchLanguages')} />
          <CommandList>
            <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
            <CommandGroup>
              {locales.map((locale) => {
                const localeName = getSharedLocaleDisplayName(locale)
                return (
                  <CommandItem
                    key={locale}
                    value={localeName}
                    onSelect={() => {
                      onValueChange(locale)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{localeName}</span>
                    {value === locale && <Check className="h-4 w-4" />}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>

          {footer}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
