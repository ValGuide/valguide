import { useLocale } from '@valguide/core/i18n/client'
import { type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { getLocalePresentation } from '@valguide/core/i18n/locale-display-names'
import { Check } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useRef } from 'react'

export interface LocalePickerListProps {
  currentLocale: SupportedLocale
  disabled?: boolean
  locales?: readonly SupportedLocale[]
  onSelectLocale: (locale: SupportedLocale) => void
}

export function LocalePickerList({
  currentLocale,
  disabled = false,
  locales = supportedLocales,
  onSelectLocale,
}: LocalePickerListProps) {
  const displayLocale = useLocale()
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const focusItem = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, locales.length - 1))
    itemRefs.current[clampedIndex]?.focus()
  }

  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      focusItem(index + 1)
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusItem(index - 1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusItem(locales.length - 1)
    }
  }

  const selectedIndex = locales.indexOf(currentLocale)

  return (
    <div role="listbox" aria-label="Language" className="max-h-[300px] overflow-y-auto p-1">
      {locales.map((locale, index) => {
        const { localizedName, nativeName, localeCode } = getLocalePresentation(locale, displayLocale)
        const isSelected = locale === currentLocale

        return (
          <button
            ref={(node) => {
              itemRefs.current[index] = node
            }}
            type="button"
            key={locale}
            role="option"
            aria-selected={isSelected}
            tabIndex={index === (selectedIndex === -1 ? 0 : selectedIndex) ? 0 : -1}
            disabled={disabled}
            onClick={() => onSelectLocale(locale)}
            onKeyDown={(event) => handleItemKeyDown(event, index)}
            className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-left outline-hidden disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-medium">{nativeName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {localizedName} ({localeCode})
              </span>
            </span>
            {isSelected && <Check className="h-4 w-4 text-primary" />}
          </button>
        )
      })}
    </div>
  )
}
