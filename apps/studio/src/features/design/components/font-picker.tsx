import { allFonts, type FontDefinition, resolveThemeFont } from '@valguide/core/features/themes/fonts'
import type { ThemeFont } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
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
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ensureThemeFontPreviewCatalogLoaded } from '../font-loader'

const categoryOrder: FontDefinition['category'][] = ['sans-serif', 'serif', 'monospace']

export interface FontPickerProps {
  label: string
  value?: ThemeFont
  inheritedValue?: ThemeFont
  allowInherit?: boolean
  showLabel?: boolean
  onValueChange: (font: ThemeFont | undefined) => void
  className?: string
}

function getCategoryLabel(category: FontDefinition['category'], t: ReturnType<typeof useTranslations>) {
  if (category === 'sans-serif') return t('fonts.categories.sans')
  if (category === 'serif') return t('fonts.categories.serif')
  return t('fonts.categories.mono')
}

export function FontPicker({
  label,
  value,
  inheritedValue,
  allowInherit = false,
  showLabel = true,
  onValueChange,
  className,
}: FontPickerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const [open, setOpen] = useState(false)
  const selectedFont = value ? resolveThemeFont(value) : inheritedValue ? resolveThemeFont(inheritedValue) : undefined
  const effectiveFontId = selectedFont?.id ?? 'noto-sans'

  useEffect(() => {
    if (!open) {
      return
    }
    void ensureThemeFontPreviewCatalogLoaded()
  }, [open])
  const groupedFonts = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          fonts: allFonts.filter((font) => font.category === category),
        }))
        .filter((group) => group.fonts.length > 0),
    [],
  )

  const buttonLabel = value
    ? (allFonts.find((font) => font.id === resolveThemeFont(value).id)?.label ?? label)
    : allowInherit
      ? t('fonts.sameAsPrimary')
      : (selectedFont?.family ?? label)

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel ? <p className="text-sm font-medium">{label}</p> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <span className="truncate">{buttonLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(30rem,calc(100vw-2rem))] p-0">
          <Command>
            <CommandInput placeholder={t('fonts.search')} />
            <CommandList>
              <CommandEmpty>{t('fonts.empty')}</CommandEmpty>
              {allowInherit ? (
                <CommandGroup heading={t('fonts.inheritance')}>
                  <CommandItem
                    value="same-as-primary"
                    onSelect={() => {
                      onValueChange(undefined)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>
                      <span className="block font-medium">{t('fonts.sameAsPrimary')}</span>
                      <span className="block text-xs text-muted-foreground">
                        {selectedFont ? selectedFont.family : t('fonts.sameAsPrimaryHint')}
                      </span>
                    </span>
                    {!value ? <Check className="h-4 w-4" /> : null}
                  </CommandItem>
                </CommandGroup>
              ) : null}
              {groupedFonts.map((group) => (
                <CommandGroup key={group.category} heading={getCategoryLabel(group.category, t)}>
                  {group.fonts.map((font) => (
                    <CommandItem
                      key={font.id}
                      value={`${font.label} ${font.description} ${font.category}`}
                      onSelect={() => {
                        onValueChange({
                          id: font.id,
                          source: font.source === 'self-hosted' ? 'self-hosted' : 'system',
                          family: font.family,
                          fallback: font.fallback,
                        })
                        setOpen(false)
                      }}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{font.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{font.description}</span>
                      </span>
                      {effectiveFontId === font.id ? <Check className="h-4 w-4" /> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
