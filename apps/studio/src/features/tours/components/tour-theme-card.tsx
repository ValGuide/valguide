import { useQueryClient } from '@tanstack/react-query'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { publishTourSettingsFn } from '@valguide/core/features/tours/tour/settings/publish-tour-settings.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
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

function ThemeSwatches({ theme, label }: { theme: NonNullable<TourDetail['theme']['effectiveTheme']>; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex overflow-hidden rounded-full border">
        <span className="size-5 border-r" style={{ backgroundColor: theme.config.colors.background }} />
        <span className="size-5 border-r" style={{ backgroundColor: theme.config.colors.primary }} />
        <span className="size-5" style={{ backgroundColor: theme.config.colors.accent }} />
      </div>
      <span className="text-sm text-muted-foreground truncate">{label}</span>
    </div>
  )
}

export function TourThemeCard({ tourNanoId, theme, variant = 'detail', className }: TourThemeCardProps) {
  const t = useTranslations('tours.theme')
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const queryClient = useQueryClient()
  const isCompact = variant === 'compact'
  const effectiveTheme = theme.effectiveTheme
  const activeThemeLabel =
    effectiveTheme?.source === 'org-default'
      ? t('workspaceDefaultTitle')
      : effectiveTheme?.source === 'default'
        ? t('builtInBadge')
        : (effectiveTheme?.name ?? t('noTheme'))

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      await publishTourSettingsFn({ data: { nanoId: tourNanoId } })
      await queryClient.invalidateQueries({ queryKey: ['tour', tourNanoId] })
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
      toast.success(t('toast.published'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.publishError')
      toast.error(message)
    } finally {
      setIsPublishing(false)
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
          <CardDescription>{t('currentCardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {theme.hasChanges ? <Badge variant="outline">{t('draftChanges')}</Badge> : null}

          {effectiveTheme ? (
            <ThemeSwatches theme={effectiveTheme} label={activeThemeLabel} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('noTheme')}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)}>{t('chooseTheme')}</Button>
            {theme.hasChanges ? (
              <Button variant="outline" onClick={() => void handlePublish()} disabled={isPublishing}>
                {t(isPublishing ? 'publishingTheme' : 'publishTheme')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <TourThemeDialog open={open} onOpenChange={setOpen} tourNanoId={tourNanoId} theme={theme} />
    </>
  )
}
