import type { Meta, StoryObj } from '@storybook/react'
import {
  applyQrOverrideToBranding,
  type EffectiveQrBranding,
  type QrBrandingOverride,
  type QrBrandingSource,
} from '@valguide/core/features/links/qr/shared'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { QrBrandingActions, QrBrandingFields } from './qr-branding-fields'
import { QrManagementPanel } from './qr-management-panel'

const inheritedBranding: EffectiveQrBranding = {
  fgColor: '#111827',
  bgColor: '#FFFFFF',
  includeLogo: false,
  logoSizeRatio: 0.18,
  quietZone: 12,
  stylePreset: 'rounded',
  source: 'system',
  logoStoragePath: null,
  hasContrastWarning: false,
}

function QrManagementPanelStory({
  title,
  description,
  source,
  inheritedSourceLabel,
  initialOverride = {},
  shortUrl = 'https://links.valguide.dev/s/TRaY0rA',
  isSaving = false,
}: {
  title: string
  description: string
  source: QrBrandingSource
  inheritedSourceLabel: string
  initialOverride?: QrBrandingOverride
  shortUrl?: string
  isSaving?: boolean
}) {
  const [open, setOpen] = useState(true)
  const [override, setOverride] = useState<QrBrandingOverride>(initialOverride)

  const branding = Object.keys(override).length
    ? applyQrOverrideToBranding(inheritedBranding, override, source)
    : { ...inheritedBranding, source }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <QrManagementPanel
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        shortUrl={shortUrl}
        branding={branding}
        sourceLabel="Systemstandard"
        note="Dieser QR-Code öffnet die Live-Tour für Besucher hinter einem stabilen Kurzlink."
        footer={<QrBrandingActions source={source} isSaving={isSaving} onSave={fn()} onReset={() => setOverride({})} />}
      >
        <QrBrandingFields
          source={source}
          override={override}
          fallbackBranding={inheritedBranding}
          inheritedSourceLabel={inheritedSourceLabel}
          onChange={setOverride}
        />
      </QrManagementPanel>
    </div>
  )
}

const meta = {
  title: 'Studio/QR/QrManagementPanel',
  component: QrManagementPanel,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: {
      viewports: [390, 1280],
    },
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: fn(),
    title: 'Tour-QR-Verteilung',
    description:
      'Verwalten Sie den kanonischen QR-Code für diese Tour und überschreiben Sie das Branding nur für diese Tour.',
    shortUrl: 'https://links.valguide.dev/s/TRaY0rA',
    branding: { ...inheritedBranding, source: 'tour' as const },
  },
} satisfies Meta<typeof QrManagementPanel>

export default meta
type Story = StoryObj<typeof meta>

export const TourBranding: Story = {
  args: {},
  render: () => (
    <QrManagementPanelStory
      title="Tour-QR-Verteilung"
      description="Verwalten Sie den kanonischen QR-Code für diese Tour und überschreiben Sie das Branding nur für diese Tour."
      source="tour"
      inheritedSourceLabel="Systemstandard"
    />
  ),
}

export const WithUnsavedChanges: Story = {
  args: {},
  render: () => (
    <QrManagementPanelStory
      title="Tour-QR-Verteilung"
      description="Verwalten Sie den kanonischen QR-Code für diese Tour und überschreiben Sie das Branding nur für diese Tour."
      source="tour"
      inheritedSourceLabel="Workspace-Standard"
      initialOverride={{
        fgColor: '#0F4C5C',
        bgColor: '#F7F3EB',
        stylePreset: 'soft',
        quietZone: 20,
        includeLogo: false,
      }}
    />
  ),
}

export const SavingState: Story = {
  args: {},
  render: () => (
    <QrManagementPanelStory
      title="Tour-QR-Verteilung"
      description="Verwalten Sie den kanonischen QR-Code für diese Tour und überschreiben Sie das Branding nur für diese Tour."
      source="tour"
      inheritedSourceLabel="Workspace-Standard"
      isSaving
      initialOverride={{
        fgColor: '#7C2D12',
        bgColor: '#FFF7ED',
        includeLogo: true,
        logoSizeRatio: 0.2,
      }}
    />
  ),
}
