import type { QrBrandingSource } from '@valguide/core/features/links/qr/shared'

type QrSourceLabelKey = 'sourceOrganization' | 'sourceTour' | 'sourceStop' | 'sourceDefault'

export function getQrBrandingSourceLabel(source: QrBrandingSource, t: (key: QrSourceLabelKey) => string): string {
  switch (source) {
    case 'organization':
      return t('sourceOrganization')
    case 'tour':
      return t('sourceTour')
    case 'stop':
      return t('sourceStop')
    default:
      return t('sourceDefault')
  }
}
