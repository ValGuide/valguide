import type { EffectiveQrBranding, QrBrandingOverride } from '@valguide/core/features/links/qr/shared'

export function getQrStyleProps(stylePreset: EffectiveQrBranding['stylePreset']) {
  switch (stylePreset) {
    case 'square':
      return {
        dotsType: 'square' as const,
        cornersSquareType: 'square' as const,
        cornersDotType: 'square' as const,
      }
    case 'soft':
      return {
        dotsType: 'classy-rounded' as const,
        cornersSquareType: 'extra-rounded' as const,
        cornersDotType: 'dot' as const,
      }
    case 'rounded':
    default:
      return {
        dotsType: 'rounded' as const,
        cornersSquareType: 'extra-rounded' as const,
        cornersDotType: 'dot' as const,
      }
  }
}

export function getQrLogoWidth(size: number, ratio: number): number {
  return Math.round(size * ratio)
}

export function sanitizeQrOverrideForCurrentUi(override: QrBrandingOverride): QrBrandingOverride {
  const { includeLogo: _includeLogo, logoSizeRatio: _logoSizeRatio, quietZone: _quietZone, ...rest } = override
  return rest
}
