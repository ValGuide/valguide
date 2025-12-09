'use client'

import type { Theme } from '@valguide/core/features/themes/schema'
import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface ThemeLibraryCardProps {
  theme: Theme
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

export function ThemeLibraryCard({ theme, isSelected, onSelect, onDelete }: ThemeLibraryCardProps) {
  const t = useTranslations('studio.themeCustomizer.themeLibrary')

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'group relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
        'hover:bg-accent/50',
        isSelected && 'ring-2 ring-primary border-primary bg-accent/30',
      )}
    >
      <div className="flex gap-0.5 shrink-0">
        <div
          className="size-6 rounded-l-md border"
          style={{ backgroundColor: theme.colors.background }}
          title="Background"
        />
        <div className="size-6 border-y" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
        <div className="size-6 border-y" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
        <div
          className="size-6 rounded-r-md border"
          style={{ backgroundColor: theme.colors.accent }}
          title="Accent"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{theme.name}</p>
        <p className="text-xs text-muted-foreground">
          {t('basedOn', { preset: theme.basePreset.charAt(0).toUpperCase() + theme.basePreset.slice(1).replace('-', ' ') })}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        aria-label={t('delete')}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
