import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { updateTourSettingsDraftFn } from '@valguide/core/features/tours/tour/settings/update-tour-settings-draft.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { RadioGroup, RadioGroupItem } from '@valguide/ui/components/radio-group'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { cn } from '@valguide/ui/lib/utils'
import { ExternalLink, Loader2, Palette } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useOrgThemes } from '@/features/design/hooks/use-org-themes'

type TourThemeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourNanoId: string
  theme: TourDetail['theme']
}

function ThemeSwatches({ theme }: { theme: NonNullable<TourDetail['theme']['effectiveTheme']> }) {
  return (
    <div className="flex overflow-hidden rounded-full border">
      <span className="size-5 border-r" style={{ backgroundColor: theme.config.colors.background }} />
      <span className="size-5 border-r" style={{ backgroundColor: theme.config.colors.primary }} />
      <span className="size-5" style={{ backgroundColor: theme.config.colors.accent }} />
    </div>
  )
}

function ThemeOptionRow({
  checked,
  value,
  title,
  badge,
  swatches,
  disabled = false,
}: {
  checked: boolean
  value: string
  title: string
  badge?: string
  swatches?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={value}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
        checked ? 'border-primary bg-primary/5' : 'hover:border-primary/40',
        disabled ? 'cursor-not-allowed opacity-60' : undefined,
      )}
    >
      <RadioGroupItem id={value} value={value} disabled={disabled} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{title}</span>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          {swatches}
        </div>
      </div>
    </label>
  )
}

export function TourThemeDialog({ open, onOpenChange, tourNanoId, theme }: TourThemeDialogProps) {
  const t = useTranslations('tours.theme')
  const queryClient = useQueryClient()
  const { themes, defaultThemeId, defaultThemeName, isLoading } = useOrgThemes({ enabled: open })
  const [selectedValue, setSelectedValue] = useState<string>('workspace-default')
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setSelectedValue(theme.assignedThemeId ?? 'workspace-default')
  }, [open, theme.assignedThemeId])

  const invalidateThemeQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['tour', tourNanoId] })
    await queryClient.invalidateQueries({ queryKey: ['tours'] })
  }, [queryClient, tourNanoId])

  const applyTheme = useCallback(async () => {
    const themeId = selectedValue === 'workspace-default' ? null : selectedValue
    setIsApplying(true)

    try {
      await updateTourSettingsDraftFn({
        data: {
          nanoId: tourNanoId,
          themeId,
        },
      })
      await invalidateThemeQueries()
      toast.success(themeId ? t('toast.updated') : t('toast.reset'))
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.error')
      toast.error(message)
    } finally {
      setIsApplying(false)
    }
  }, [invalidateThemeQueries, onOpenChange, selectedValue, t, tourNanoId])

  const selectionMatchesLiveTheme = (theme.assignedThemeId ?? 'workspace-default') === selectedValue
  const workspaceDefaultTheme = theme.workspaceDefaultTheme
  const defaultOptionTitle = defaultThemeId ? t('workspaceDefaultTitle') : t('sourceDefault')
  const defaultOptionBadge = defaultThemeId ? t('sourceOrgDefault') : t('builtInBadge')

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="full-height">
      <ResponsiveDialogContent className="flex min-h-0 flex-col overflow-hidden sm:max-h-[min(90dvh,48rem)] sm:max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Palette className="size-4" />
            {t('dialogTitle')}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{t('dialogDescription')}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('pickerTitle')}</h3>

            <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
              <ThemeOptionRow
                checked={selectedValue === 'workspace-default'}
                value="workspace-default"
                title={defaultOptionTitle}
                badge={defaultOptionBadge}
                swatches={workspaceDefaultTheme ? <ThemeSwatches theme={workspaceDefaultTheme} /> : null}
              />

              {isLoading ? (
                <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {t('loadingThemes')}
                </div>
              ) : themes.length > 0 ? (
                themes.map((savedTheme) => (
                  <ThemeOptionRow
                    key={savedTheme.id}
                    checked={selectedValue === savedTheme.id}
                    value={savedTheme.id}
                    title={savedTheme.name}
                    badge={savedTheme.id === defaultThemeId ? t('defaultBadge') : undefined}
                    swatches={
                      <div className="flex overflow-hidden rounded-full border">
                        <span className="size-5 border-r" style={{ backgroundColor: savedTheme.colors.background }} />
                        <span className="size-5 border-r" style={{ backgroundColor: savedTheme.colors.primary }} />
                        <span className="size-5" style={{ backgroundColor: savedTheme.colors.accent }} />
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('emptyThemesTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('emptyThemesDescription')}</p>
                  </div>
                  <Button variant="link" className="mt-3 h-auto p-0 text-sm" asChild>
                    <Link to="/brand/theme" target="_blank" rel="noreferrer">
                      {t('manageThemesAction')}
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </RadioGroup>
          </div>

          {themes.length > 0 ? (
            <Button variant="link" className="h-auto w-fit p-0 text-sm" asChild>
              <Link to="/brand/theme" target="_blank" rel="noreferrer">
                {t('manageMoreThemesAction')}
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          ) : null}
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            {t('cancel')}
          </Button>
          <Button onClick={() => void applyTheme()} disabled={isApplying || selectionMatchesLiveTheme}>
            {isApplying ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('apply')}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
