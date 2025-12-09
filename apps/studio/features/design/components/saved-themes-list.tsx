'use client'

import type { Theme } from '@valguide/core/features/themes/schema'
import { Button } from '@valguide/ui/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@valguide/ui/components/collapsible'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (themes.length === 0) {
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
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme)}
                className={cn(
                  'group relative flex w-full items-center gap-2 p-2 rounded-md border cursor-pointer transition-all text-left',
                  'hover:bg-accent/50',
                  isSelected && 'ring-2 ring-primary border-primary bg-accent/30',
                )}
              >
                <div className="flex gap-px shrink-0">
                  <div className="size-5 rounded-l border" style={{ backgroundColor: theme.colors.background }} />
                  <div className="size-5 border-y" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="size-5 rounded-r border" style={{ backgroundColor: theme.colors.accent }} />
                </div>

                <span className="flex-1 text-sm font-medium truncate">{theme.name}</span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteTheme(theme)
                  }}
                  aria-label={t('themeLibrary.delete')}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </button>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
