import type { EffectiveQrBranding, QrAnalyticsSummary } from '@valguide/core/features/links/qr/shared'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@valguide/ui/components/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { useIsMobile } from '@valguide/ui/hooks/use-mobile'
import type { ReactNode } from 'react'
import { QrPreviewCard } from './qr-preview-card'

type QrManagementPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  shortUrl: string
  branding: EffectiveQrBranding
  analytics?: QrAnalyticsSummary
  sourceLabel?: string
  note?: string
  children?: ReactNode
  footer?: ReactNode
}

function formatLastOpened(value: string | null, fallback: string): string {
  if (!value) return fallback
  return new Date(value).toLocaleString()
}

function QrDistributionDetails({
  analytics,
  sourceLabel,
  note,
}: Pick<QrManagementPanelProps, 'analytics' | 'sourceLabel' | 'note'>) {
  const t = useTranslations('studio.qr')

  if (!analytics && !sourceLabel && !note) {
    return null
  }

  const showTabs = Boolean(analytics && (sourceLabel || note))

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      {showTabs ? (
        <Tabs defaultValue="branding" className="gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="branding">{t('brandingTab')}</TabsTrigger>
            <TabsTrigger value="stats">{t('statsTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-4">
            {sourceLabel ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('brandingSource')}</p>
                <Badge variant="secondary">{sourceLabel}</Badge>
              </div>
            ) : null}
            {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
          </TabsContent>

          <TabsContent value="stats" className="space-y-3">
            {analytics ? (
              <div className="grid gap-3">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('totalOpens')}</p>
                  <p className="mt-1 text-2xl font-semibold">{analytics.openCount}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('lastOpened')}</p>
                  <p className="mt-1 text-sm font-medium">
                    {formatLastOpened(analytics.lastOpenedAt, t('neverOpened'))}
                  </p>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {sourceLabel ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('brandingSource')}</span>
              <Badge variant="secondary">{sourceLabel}</Badge>
            </div>
          ) : null}

          {analytics ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('totalOpens')}</p>
                <p className="mt-1 text-2xl font-semibold">{analytics.openCount}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('lastOpened')}</p>
                <p className="mt-1 text-sm font-medium">{formatLastOpened(analytics.lastOpenedAt, t('neverOpened'))}</p>
              </div>
            </div>
          ) : null}

          {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
        </>
      )}
    </div>
  )
}

function QrManagementPanelContent({
  title,
  description,
  shortUrl,
  branding,
  analytics,
  sourceLabel,
  note,
  children,
  footer,
}: Omit<QrManagementPanelProps, 'open' | 'onOpenChange'>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <DrawerHeader className="border-b px-4 pb-4 text-left sm:text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-4">
            <QrPreviewCard
              shortUrl={shortUrl}
              branding={branding}
              analytics={analytics}
              sourceLabel={sourceLabel}
              note={note}
              variant="plain"
              showHeader={false}
              size={176}
              showAnalytics={false}
              showNote={false}
              showSourceLabel={false}
            />
            <QrDistributionDetails analytics={analytics} sourceLabel={sourceLabel} note={note} />
            {children}
          </div>
        </ScrollArea>

        {footer ? (
          <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
            {footer}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-[minmax(18rem,20rem),minmax(0,1fr)] grid-rows-[minmax(0,1fr),auto] overflow-hidden">
          <div className="row-span-2 flex min-h-0 flex-col border-r bg-background p-6">
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-6 pr-4">
                <QrPreviewCard
                  shortUrl={shortUrl}
                  branding={branding}
                  analytics={analytics}
                  sourceLabel={sourceLabel}
                  note={note}
                  variant="plain"
                  showHeader={false}
                  size={200}
                  showAnalytics={false}
                  showNote={false}
                  showSourceLabel={false}
                />
                <QrDistributionDetails analytics={analytics} sourceLabel={sourceLabel} note={note} />
              </div>
            </ScrollArea>
          </div>

          <ScrollArea className="h-full min-h-0">
            <div className="p-6">{children}</div>
          </ScrollArea>

          {footer ? (
            <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function QrManagementPanel(props: QrManagementPanelProps) {
  const t = useTranslations('studio.qr')
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={props.open} onOpenChange={props.onOpenChange}>
        <DrawerContent className="h-[min(90dvh,48rem)] max-h-[90dvh] overflow-hidden">
          <QrManagementPanelContent {...props} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <QrManagementPanelContent {...props} title={props.title || t('manageQr')} description={props.description} />
      </SheetContent>
    </Sheet>
  )
}
