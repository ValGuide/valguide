import type { EffectiveQrBranding, QrAnalyticsSummary } from '@valguide/core/features/links/qr/shared'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { QrManagementPanel } from './qr-management-panel'
import { QrSummaryCard } from './qr-summary-card'

type QrCompactSurfaceProps = {
  summaryTitle: string
  summaryDescription: string
  manageTitle: string
  manageDescription: string
  shortUrl: string
  branding: EffectiveQrBranding
  analytics?: QrAnalyticsSummary
  sourceLabel?: string
  note?: string
  children?: ReactNode
}

export function QrCompactSurface({
  summaryTitle,
  summaryDescription,
  manageTitle,
  manageDescription,
  shortUrl,
  branding,
  analytics,
  sourceLabel,
  note,
  children,
}: QrCompactSurfaceProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <QrSummaryCard
        title={summaryTitle}
        description={summaryDescription}
        shortUrl={shortUrl}
        branding={branding}
        analytics={analytics}
        sourceLabel={sourceLabel}
        onManage={() => setOpen(true)}
      />
      <QrManagementPanel
        open={open}
        onOpenChange={setOpen}
        title={manageTitle}
        description={manageDescription}
        shortUrl={shortUrl}
        branding={branding}
        analytics={analytics}
        sourceLabel={sourceLabel}
        note={note}
      >
        {children}
      </QrManagementPanel>
    </>
  )
}
