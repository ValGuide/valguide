import { useQueryClient } from '@tanstack/react-query'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { updateTourSettingsDraftFn } from '@valguide/core/features/tours/tour/settings/update-tour-settings-draft.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { cn } from '@valguide/ui/lib/utils'
import { Loader2, Paintbrush2 } from 'lucide-react'
import { useState } from 'react'
import { TourThemeDialog } from './tour-theme-dialog'

type TourThemeCardProps = {
  tourNanoId: string
  theme: TourDetail['theme']
  variant?: 'detail' | 'compact'
  className?: string
}

function ThemeSwatches({ theme }: { theme: NonNullable<TourDetail['theme']['effectiveTheme']> }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex overflow-hidden rounded-full border">
        <span className="size-5 border-r" style={{ backgroundColor: theme.config.colors.background }} />
        <span className="size-5 border-r" style={{ backgroundColor: theme.config.colors.primary }} />
        <span className="size-5" style={{ backgroundColor: theme.config.colors.accent }} />
      </div>
      <span className="text-sm text-muted-foreground truncate">{theme.name}</span>
    </div>
  )
}

export function TourThemeCard({ tourNanoId, theme, variant = 'detail', className }: TourThemeCardProps) {
  const t = useTranslations('tours.theme')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const isCompact = variant === 'compact'
  const effectiveTheme = theme.effectiveTheme
  const sourceLabel =
    effectiveTheme?.source === 'tour'
      ? t('sourceTour')
      : effectiveTheme?.source === 'org-default'
        ? t('sourceOrgDefault')
        : effectiveTheme?.source === 'default'
          ? t('sourceDefault')
          : t('sourceNone')

  const handleResetToDefault = async () => {
    setIsResetting(true)

    try {
      await updateTourSettingsDraftFn({
        data: {
          nanoId: tourNanoId,
          themeId: null,
        },
      })
      await queryClient.invalidateQueries({ queryKey: ['tour', tourNanoId] })
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
      toast.success(t('toast.reset'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.error')
      toast.error(message)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className={cn(isCompact ? 'pb-3' : undefined)}>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush2 className="size-4" />
            {t(isCompact ? 'compactTitle' : 'title')}
          </CardTitle>
          <CardDescription>{t(isCompact ? 'compactDescription' : 'description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={effectiveTheme?.source === 'tour' ? 'default' : 'secondary'}>{sourceLabel}</Badge>
            {theme.hasChanges ? <Badge variant="outline">{t('draftChanges')}</Badge> : null}
          </div>

          {effectiveTheme ? (
            <ThemeSwatches theme={effectiveTheme} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('noTheme')}</p>
          )}

          {theme.hasChanges && theme.publishedTheme ? (
            <p className="text-sm text-muted-foreground">
              {t('publishedSummary', { name: theme.publishedTheme.name })}
            </p>
          ) : effectiveTheme?.source === 'org-default' ? (
            <p className="text-sm text-muted-foreground">{t('inheritsWorkspaceDefault')}</p>
          ) : effectiveTheme?.source === 'default' ? (
            <p className="text-sm text-muted-foreground">{t('inheritsBuiltInDefault')}</p>
          ) : theme.assignedThemeId ? (
            <p className="text-sm text-muted-foreground">{t('appliesOnlyToTour')}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noThemeDescription')}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)} disabled={isResetting}>
              {t('changeTheme')}
            </Button>
            {theme.assignedThemeId ? (
              <Button variant="outline" onClick={() => void handleResetToDefault()} disabled={isResetting}>
                {isResetting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {t('resetToDefault')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <TourThemeDialog open={open} onOpenChange={setOpen} tourNanoId={tourNanoId} theme={theme} />
    </>
  )
}
