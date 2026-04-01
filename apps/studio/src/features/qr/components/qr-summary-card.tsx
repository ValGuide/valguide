import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { EffectiveQrBranding, QrAnalyticsSummary } from '@valguide/core/features/links/qr/shared'
import { QRCode } from '@valguide/core/features/qrcodes'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardTitle } from '@valguide/ui/components/card'
import { MetadataRow } from '@valguide/ui/components/metadata-row'
import { Separator } from '@valguide/ui/components/separator'
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
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{t('shortUrl')}</p>
              <p className="break-all font-mono text-sm leading-6">{shortUrl}</p>
            </div>

            <Separator className="my-4" />

            <dl className="grid gap-4 sm:grid-cols-2">
              {sourceLabel ? (
                <MetadataRow label={t('brandingSource')} value={<Badge variant="secondary">{sourceLabel}</Badge>} />
              ) : null}
              {analytics ? (
                <MetadataRow
                  label={t('totalOpens')}
                  value={
                    analytics.openCount > 0
                      ? t('inlineOpenCount', { count: analytics.openCount })
                      : t('inlineNeverOpened')
                  }
                />
              ) : null}
            </dl>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
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
            </div>

            <Button size="sm" onClick={onManage} className="sm:ml-auto">
              <Settings2 className="h-4 w-4" />
              {t('manageQr')}
            </Button>
          </div>
        </div>

        <div className="justify-self-start lg:justify-self-end">
          <div className="rounded-xl border bg-background p-2 shadow-sm">
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
      </CardContent>
    </Card>
  )
}
