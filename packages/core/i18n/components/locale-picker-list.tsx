import { type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { Command, CommandGroup, CommandItem, CommandList } from '@valguide/core/ui/components/command'
import { Check } from 'lucide-react'
import { useMemo } from 'react'

export interface LocalePickerListProps {
  currentLocale: SupportedLocale
  disabled?: boolean
  onSelectLocale: (locale: SupportedLocale) => void
}

export function LocalePickerList({ currentLocale, disabled = false, onSelectLocale }: LocalePickerListProps) {
  const englishDisplayNames = useMemo(() => new Intl.DisplayNames(['en'], { type: 'language' }), [])
  const nativeDisplayNames = useMemo(
    () => new Intl.DisplayNames([currentLocale], { type: 'language' }),
    [currentLocale],
  )

  return (
    <Command className="border-none">
      <CommandList className="max-h-[300px]">
        <CommandGroup>
          {supportedLocales.map((locale) => {
            const nativeName = nativeDisplayNames.of(locale) ?? locale
            const englishName = englishDisplayNames.of(locale) ?? locale
            const showEnglishName = nativeName !== englishName

            return (
              <CommandItem
                key={locale}
                value={`${nativeName} ${englishName} ${locale}`}
                onSelect={() => onSelectLocale(locale)}
                disabled={disabled}
                className="flex items-center gap-2 py-2.5"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{nativeName}</span>
                  {showEnglishName && (
                    <span className="truncate text-xs text-muted-foreground">
                      {englishName} ({locale})
                    </span>
                  )}
                  {!showEnglishName && <span className="text-xs text-muted-foreground">({locale})</span>}
                </span>
                {currentLocale === locale && <Check className="ml-auto h-4 w-4 text-primary" />}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
