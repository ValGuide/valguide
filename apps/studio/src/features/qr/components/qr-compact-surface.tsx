import type { EffectiveQrBranding } from '@valguide/core/features/links/qr/shared'
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
  downloadFileName?: string
  note?: string
  children?: ReactNode
  footer?: ReactNode
}

export function QrCompactSurface({
  summaryTitle,
  summaryDescription,
  manageTitle,
  manageDescription,
  shortUrl,
  branding,
  downloadFileName,
  note,
  children,
  footer,
}: QrCompactSurfaceProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <QrSummaryCard
        title={summaryTitle}
        description={summaryDescription}
        shortUrl={shortUrl}
        branding={branding}
        downloadFileName={downloadFileName}
        onManage={() => setOpen(true)}
      />
      <QrManagementPanel
        open={open}
        onOpenChange={setOpen}
        title={manageTitle}
        description={manageDescription}
        shortUrl={shortUrl}
        branding={branding}
        downloadFileName={downloadFileName}
        note={note}
        footer={footer}
      >
        {children}
      </QrManagementPanel>
    </>
  )
}
