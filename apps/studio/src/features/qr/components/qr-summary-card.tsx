import type { EffectiveQrBranding } from '@valguide/core/features/links/qr/shared'
import { QRCode } from '@valguide/core/features/qrcodes'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardTitle } from '@valguide/ui/components/card'
import { ExternalLink, Settings2 } from 'lucide-react'
import { getQrStyleProps } from '../branding'

type QrSummaryCardProps = {
  title: string
  description: string
  shortUrl: string
  branding: EffectiveQrBranding
  onManage: () => void
}

export function QrSummaryCard({ title, description, shortUrl, branding, onManage }: QrSummaryCardProps) {
  const t = useTranslations('studio.qr')
  const styleProps = getQrStyleProps(branding.stylePreset)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    toast.success(t('linkCopied'))
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="space-y-1.5">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{t('shortUrl')}</p>
              <p className="break-all font-mono text-sm leading-6 sm:text-base">{shortUrl}</p>
            </div>
          </div>

          <div className="flex shrink-0 justify-start sm:justify-end">
            <div className="flex h-28 w-28 items-center justify-center rounded-[1.5rem] border bg-muted/20 p-1.5 shadow-sm">
              <QRCode
                value={shortUrl}
                width={96}
                height={96}
                fgColor={branding.fgColor}
                bgColor={branding.bgColor}
                margin={0}
                {...styleProps}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
            {t('copyLink')}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={shortUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t('openLink')}
            </a>
          </Button>
          <Button size="sm" onClick={onManage} className="gap-2 sm:ml-auto">
            <Settings2 className="h-4 w-4" />
            {t('manageQr')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
