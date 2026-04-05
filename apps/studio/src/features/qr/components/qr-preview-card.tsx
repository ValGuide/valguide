import type { EffectiveQrBranding } from '@valguide/core/features/links/qr/shared'
import { QRCode } from '@valguide/core/features/qrcodes'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { getQrStyleProps } from '../branding'

type QrPreviewCardProps = {
  title?: string
  description?: string
  shortUrl: string
  branding: EffectiveQrBranding
  downloadFileName?: string
  sourceLabel?: string
  note?: string
  children?: ReactNode
  size?: number
  variant?: 'card' | 'plain'
  showHeader?: boolean
  showDownloads?: boolean
  showShortUrl?: boolean
  showActions?: boolean
  showSourceLabel?: boolean
  showNote?: boolean
}

export function QrPreviewCard({
  title,
  description,
  shortUrl,
  branding,
  downloadFileName,
  sourceLabel,
  note,
  children,
  size = 220,
  variant = 'card',
  showHeader = true,
  showDownloads = true,
  showShortUrl = true,
  showActions = true,
  showSourceLabel = true,
  showNote = true,
}: QrPreviewCardProps) {
  const t = useTranslations('studio.qr')
  const qrSize = Math.max(size - 20, 96)
  const styleProps = getQrStyleProps(branding.stylePreset)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    toast.success(t('linkCopied'))
  }

  const content = (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[auto,minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/20 p-3 sm:gap-4 sm:p-5">
          <QRCode
            value={shortUrl}
            width={qrSize}
            height={qrSize}
            fgColor={branding.fgColor}
            bgColor={branding.bgColor}
            margin={branding.quietZone}
            showDownloadButtons={showDownloads}
            downloadFileName={downloadFileName}
            {...styleProps}
          />
          {branding.hasContrastWarning && (
            <p className="max-w-[18rem] text-center text-xs leading-5 text-amber-700">{t('contrastWarning')}</p>
          )}
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-5">
          {showShortUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{t('shortUrl')}</p>
              <p className="break-all font-mono text-sm leading-6 min-[360px]:text-base">{shortUrl}</p>
            </div>
          ) : null}

          {showActions ? (
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
          ) : null}

          {showSourceLabel && sourceLabel && (
            <div className="space-y-2 rounded-xl border bg-muted/20 p-3 sm:p-4">
              <p className="text-sm font-medium">{t('brandingSource')}</p>
              <Badge variant="secondary">{sourceLabel}</Badge>
              {showNote && note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
            </div>
          )}
        </div>
      </div>

      {!showSourceLabel && showNote && note ? <p className="text-sm text-muted-foreground">{note}</p> : null}

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
      <CardContent className="space-y-6 p-3 sm:p-6">{content}</CardContent>
    </Card>
  )
}
