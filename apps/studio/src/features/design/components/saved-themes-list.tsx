import type { Theme } from '@valguide/core/features/themes/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import { cn } from '@valguide/ui/lib/utils'
import { Check, CircleHelp, MoreHorizontal, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'

export interface SavedThemesListProps {
  themes: Theme[]
  isLoading: boolean
  selectedThemeId?: string
  defaultThemeId?: string | null
  canManageDefaultTheme?: boolean
  onSelectTheme: (theme: Theme) => void
  onDeleteTheme?: (theme: Theme) => void
  onSetDefaultTheme?: (theme: Theme) => Promise<void>
  onClearDefaultTheme?: () => Promise<void>
  showDelete?: boolean
  className?: string
}

export function SavedThemesList({
  themes,
  isLoading,
  selectedThemeId,
  defaultThemeId,
  canManageDefaultTheme = false,
  onSelectTheme,
  onDeleteTheme,
  onSetDefaultTheme,
  onClearDefaultTheme,
  showDelete = true,
  className,
}: SavedThemesListProps) {
  const t = useTranslations('studio.themeCustomizer')
  const [pendingDefaultThemeId, setPendingDefaultThemeId] = useState<string | null>(null)

  if (isLoading || themes.length === 0) {
    return null
  }

  const handleSetDefaultTheme = async (theme: Theme) => {
    if (!onSetDefaultTheme) {
      return
    }

    setPendingDefaultThemeId(theme.id)
    try {
      await onSetDefaultTheme(theme)
    } finally {
      setPendingDefaultThemeId(null)
    }
  }

  const handleClearDefaultTheme = async () => {
    if (!onClearDefaultTheme) {
      return
    }

    setPendingDefaultThemeId('__clear__')
    try {
      await onClearDefaultTheme()
    } finally {
      setPendingDefaultThemeId(null)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium">{t('savedThemes', { count: themes.length })}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex size-7 shrink-0 cursor-help items-center justify-center rounded-lg leading-none text-muted-foreground">
                <CircleHelp className="size-3.5" />
                <span className="sr-only">{t('themeLibrary.descriptionTooltipLabel')}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-64 text-xs">
              {t('themeLibrary.description')}
            </TooltipContent>
          </Tooltip>
        </div>
        {canManageDefaultTheme && defaultThemeId && onClearDefaultTheme ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleClearDefaultTheme()}
            disabled={pendingDefaultThemeId !== null}
            className="h-8 shrink-0 px-2 text-xs"
          >
            {t('themeLibrary.resetToValGuideDefault')}
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        {themes.map((theme) => {
          const isSelected = theme.id === selectedThemeId
          const isDefault = theme.id === defaultThemeId
          const isSettingDefault = pendingDefaultThemeId === theme.id
          const canOpenMenu =
            (canManageDefaultTheme && onSetDefaultTheme && !isDefault) || (showDelete && onDeleteTheme)
          const swatches = [
            { key: 'background', color: theme.colors.background },
            { key: 'primary', color: theme.colors.primary },
            { key: 'accent', color: theme.colors.accent },
          ]

          return (
            <div
              key={theme.id}
              className={cn(
                'group relative rounded-xl border bg-background transition-all',
                'hover:border-primary/20 hover:bg-accent/20',
                isSelected && 'border-primary bg-accent/25 ring-2 ring-primary/15',
              )}
            >
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => onSelectTheme(theme)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <div className="flex w-16 shrink-0 gap-1 sm:w-20">
                    {swatches.map((swatch) => (
                      <div
                        key={`${theme.id}-${swatch.key}`}
                        className="h-12 flex-1 rounded-md border border-border/70 shadow-xs"
                        style={{ backgroundColor: swatch.color }}
                      />
                    ))}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{theme.name}</span>
                      {isDefault ? <Badge variant="outline">{t('themeLibrary.defaultBadge')}</Badge> : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{t('themeLibrary.selectHint')}</p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {isSelected ? <Check className="mt-1 size-4 text-primary" aria-hidden="true" /> : null}

                  {canOpenMenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t('themeLibrary.actions')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManageDefaultTheme && onSetDefaultTheme && !isDefault ? (
                          <DropdownMenuItem
                            onClick={() => void handleSetDefaultTheme(theme)}
                            disabled={pendingDefaultThemeId !== null}
                          >
                            <Star className="size-4" />
                            {isSettingDefault
                              ? t('themeLibrary.settingDefaultTheme')
                              : t('themeLibrary.setAsDefaultTheme')}
                          </DropdownMenuItem>
                        ) : null}
                        {showDelete && onDeleteTheme ? (
                          <DropdownMenuItem variant="destructive" onClick={() => onDeleteTheme(theme)}>
                            <Trash2 className="size-4" />
                            {t('themeLibrary.delete')}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
