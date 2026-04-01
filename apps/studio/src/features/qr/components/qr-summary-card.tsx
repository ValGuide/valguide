import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { EffectiveQrBranding, QrAnalyticsSummary } from '@valguide/core/features/links/qr/shared'
import { QRCode } from '@valguide/core/features/qrcodes'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ExternalLink, Settings2 } from 'lucide-react'
import { useMemo } from 'react'
import { getQrLogoWidth, getQrStyleProps } from '../branding'

type QrSummaryCardProps = {
  title: string
  description: string
  shortUrl: string
  branding: EffectiveQrBranding
  analytics?: QrAnalyticsSummary
  sourceLabel?: string
  onManage: () => void
}

export function QrSummaryCard({
  title,
  description,
  shortUrl,
  branding,
  analytics,
  sourceLabel,
  onManage,
}: QrSummaryCardProps) {
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="self-start rounded-xl border bg-background p-2">
            <QRCode
              value={shortUrl}
              width={88}
              height={88}
              fgColor={branding.fgColor}
              bgColor={branding.bgColor}
              logoUrl={logoUrl}
              logoWidth={branding.logoStoragePath ? getQrLogoWidth(88, branding.logoSizeRatio) : 0}
              margin={branding.quietZone}
              {...styleProps}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{t('shortUrl')}</p>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="break-all font-mono text-sm">{shortUrl}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
            {t('copyLink')}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={shortUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t('openLink')}
            </a>
          </Button>
          <Button size="sm" onClick={onManage}>
            <Settings2 className="h-4 w-4" />
            {t('manageQr')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {sourceLabel ? (
            <>
              <span>{t('brandingSource')}</span>
              <Badge variant="secondary">{sourceLabel}</Badge>
            </>
          ) : null}
          {analytics ? (
            <span className="text-sm text-muted-foreground">
              {analytics.openCount > 0 ? t('inlineOpenCount', { count: analytics.openCount }) : t('inlineNeverOpened')}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
