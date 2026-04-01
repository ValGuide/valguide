import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { EffectiveQrBranding, QrAnalyticsSummary } from '@valguide/core/features/links/qr/shared'
import { QRCode } from '@valguide/core/features/qrcodes'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ExternalLink } from 'lucide-react'
import { type ReactNode, useMemo } from 'react'
import { getQrLogoWidth, getQrStyleProps } from '../branding'

type QrPreviewCardProps = {
  title?: string
  description?: string
  shortUrl: string
  branding: EffectiveQrBranding
  analytics?: QrAnalyticsSummary
  sourceLabel?: string
  note?: string
  children?: ReactNode
  size?: number
  variant?: 'card' | 'plain'
  showHeader?: boolean
  showSourceLabel?: boolean
  showAnalytics?: boolean
  showNote?: boolean
}

function formatLastOpened(value: string | null, fallback: string): string {
  if (!value) return fallback
  return new Date(value).toLocaleString()
}

export function QrPreviewCard({
  title,
  description,
  shortUrl,
  branding,
  analytics,
  sourceLabel,
  note,
  children,
  size = 220,
  variant = 'card',
  showHeader = true,
  showSourceLabel = true,
  showAnalytics = true,
  showNote = true,
}: QrPreviewCardProps) {
  const t = useTranslations('studio.qr')
  const logoUrl = useMemo(
    () => (branding.logoStoragePath ? getAssetImageUrl({ storagePath: branding.logoStoragePath }) : undefined),
    [branding.logoStoragePath],
  )
  const styleProps = getQrStyleProps(branding.stylePreset)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    toast.success(t('linkCopied'))
  }

  const content = (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
        <div className="flex flex-col items-center gap-4">
          <QRCode
            value={shortUrl}
            width={size}
            height={size}
            fgColor={branding.fgColor}
            bgColor={branding.bgColor}
            logoUrl={logoUrl}
            logoWidth={branding.logoStoragePath ? getQrLogoWidth(size, branding.logoSizeRatio) : 0}
            margin={branding.quietZone}
            showDownloadButtons
            {...styleProps}
          />
          {branding.hasContrastWarning && (
            <p className="max-w-[18rem] text-center text-xs text-amber-700">{t('contrastWarning')}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{t('shortUrl')}</p>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="break-all font-mono text-sm">{shortUrl}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void handleCopy()}>
              {t('copyLink')}
            </Button>
            <Button variant="outline" asChild>
              <a href={shortUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                {t('openLink')}
              </a>
            </Button>
          </div>

          {showSourceLabel && sourceLabel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('brandingSource')}</span>
              <Badge variant="secondary">{sourceLabel}</Badge>
            </div>
          )}

          {showAnalytics && analytics && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('totalOpens')}</p>
                <p className="mt-1 text-2xl font-semibold">{analytics.openCount}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('lastOpened')}</p>
                <p className="mt-1 text-sm font-medium">{formatLastOpened(analytics.lastOpenedAt, t('neverOpened'))}</p>
              </div>
            </div>
          )}

          {showNote && note && <p className="text-sm text-muted-foreground">{note}</p>}
        </div>
      </div>

      {children}
    </div>
  )

  if (variant === 'plain') {
    return (
      <div className="space-y-6">
        {showHeader && title && description ? (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ) : null}
        {content}
      </div>
    )
  }

  return (
    <Card>
      {showHeader && title && description ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className="space-y-6">{content}</CardContent>
    </Card>
  )
}
