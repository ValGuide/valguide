import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { cn } from '@valguide/ui/lib/utils'
import { Paintbrush2 } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
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
            <Button onClick={() => setOpen(true)}>{t('changeTheme')}</Button>
            {theme.assignedThemeId ? (
              <Button variant="outline" onClick={() => setOpen(true)}>
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
