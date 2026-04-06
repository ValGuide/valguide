import type { Theme } from '@valguide/core/features/themes/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@valguide/ui/components/collapsible'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronDown, Trash2 } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(true)
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

  const defaultTheme = themes.find((theme) => theme.id === defaultThemeId) ?? null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
        {t('savedThemes', { count: themes.length })}
        <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 pt-1">
          {defaultTheme ? (
            <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs font-medium text-muted-foreground">{t('themeLibrary.defaultTheme')}</span>
                  <span className="truncate text-sm font-medium">{defaultTheme.name}</span>
                </div>
              </div>
              {canManageDefaultTheme && onClearDefaultTheme ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleClearDefaultTheme()}
                  disabled={pendingDefaultThemeId !== null}
                  className="h-7 shrink-0 px-2 text-xs"
                >
                  {t('themeLibrary.resetToValGuideDefault')}
                </Button>
              ) : null}
            </div>
          ) : null}

          {themes.map((theme) => {
            const isSelected = theme.id === selectedThemeId
            const isDefault = theme.id === defaultThemeId
            const isSettingDefault = pendingDefaultThemeId === theme.id
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
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">{theme.name}</span>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {isDefault ? <Badge variant="outline">{t('themeLibrary.defaultBadge')}</Badge> : null}

                  {canManageDefaultTheme && onSetDefaultTheme && !isDefault ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => void handleSetDefaultTheme(theme)}
                      disabled={pendingDefaultThemeId !== null}
                    >
                      {isSettingDefault ? t('themeLibrary.settingDefaultTheme') : t('themeLibrary.setAsDefaultTheme')}
                    </Button>
                  ) : null}

                  {showDelete && onDeleteTheme ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-100 min-[1180px]:opacity-0 min-[1180px]:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => onDeleteTheme(theme)}
                      aria-label={t('themeLibrary.delete')}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
