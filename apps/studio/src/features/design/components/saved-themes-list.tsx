import type { Theme } from '@valguide/core/features/themes/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@valguide/ui/components/collapsible'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useState } from 'react'

export interface SavedThemesListProps {
  themes: Theme[]
  isLoading: boolean
  selectedThemeId?: string
  onSelectTheme: (theme: Theme) => void
  onDeleteTheme: (theme: Theme) => void
  className?: string
}

export function SavedThemesList({
  themes,
  isLoading,
  selectedThemeId,
  onSelectTheme,
  onDeleteTheme,
  className,
}: SavedThemesListProps) {
  const t = useTranslations('studio.themeCustomizer')
  const [isOpen, setIsOpen] = useState(true)

  if (isLoading || themes.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
        {t('savedThemes', { count: themes.length })}
        <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 pt-1">
          {themes.map((theme) => {
            const isSelected = theme.id === selectedThemeId
            return (
              <div
                key={theme.id}
                className={cn(
                  'group relative flex w-full items-center gap-2 p-2 rounded-md border transition-all',
                  'hover:bg-accent/50',
                  isSelected && 'ring-2 ring-primary border-primary bg-accent/30',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectTheme(theme)}
                  className="flex flex-1 items-center gap-2 text-left min-w-0"
                >
                  <div className="flex gap-px shrink-0">
                    <div className="size-5 rounded-l border" style={{ backgroundColor: theme.colors.background }} />
                    <div className="size-5 border-y" style={{ backgroundColor: theme.colors.primary }} />
                    <div className="size-5 rounded-r border" style={{ backgroundColor: theme.colors.accent }} />
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{theme.name}</span>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => onDeleteTheme(theme)}
                  aria-label={t('themeLibrary.delete')}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
