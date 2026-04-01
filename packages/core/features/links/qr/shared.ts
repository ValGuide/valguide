import { z } from 'zod'
import { hasGoodContrast } from '../../qrcodes/utils'

export const qrStylePresetValues = ['rounded', 'square', 'soft'] as const
export type QrStylePreset = (typeof qrStylePresetValues)[number]

export const qrBrandingSourceValues = ['system', 'organization', 'tour', 'stop'] as const
export type QrBrandingSource = (typeof qrBrandingSourceValues)[number]

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)
const logoSizeRatioSchema = z.number().min(0.12).max(0.22)
const quietZoneSchema = z.number().int().min(0).max(32)

export const qrBrandingOverrideSchema = z.object({
  fgColor: colorSchema.optional(),
  bgColor: colorSchema.optional(),
  includeLogo: z.boolean().optional(),
  logoSizeRatio: logoSizeRatioSchema.optional(),
  quietZone: quietZoneSchema.optional(),
  stylePreset: z.enum(qrStylePresetValues).optional(),
})

export type QrBrandingOverride = z.infer<typeof qrBrandingOverrideSchema>

export type QrBrandingConfig = {
  fgColor: string
  bgColor: string
  includeLogo: boolean
  logoSizeRatio: number
  quietZone: number
  stylePreset: QrStylePreset
}

export type EffectiveQrBranding = QrBrandingConfig & {
  source: QrBrandingSource
  logoStoragePath: string | null
  hasContrastWarning: boolean
}

export type QrAnalyticsSummary = {
  openCount: number
  lastOpenedAt: string | null
  dailyOpens: Array<{
    day: string
    openCount: number
  }>
}

export const DEFAULT_QR_BRANDING: QrBrandingConfig = {
  fgColor: '#111827',
  bgColor: '#FFFFFF',
  includeLogo: true,
  logoSizeRatio: 0.18,
  quietZone: 12,
  stylePreset: 'rounded',
}

export function sanitizeQrBrandingOverride(value: unknown): QrBrandingOverride {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const raw = value as Record<string, unknown>
  const sanitized: QrBrandingOverride = {}

  const fgColor = colorSchema.safeParse(raw.fgColor)
  if (fgColor.success) sanitized.fgColor = fgColor.data

  const bgColor = colorSchema.safeParse(raw.bgColor)
  if (bgColor.success) sanitized.bgColor = bgColor.data

  const includeLogo = z.boolean().safeParse(raw.includeLogo)
  if (includeLogo.success) sanitized.includeLogo = includeLogo.data

  const logoSizeRatio = logoSizeRatioSchema.safeParse(raw.logoSizeRatio)
  if (logoSizeRatio.success) sanitized.logoSizeRatio = logoSizeRatio.data

  const quietZone = quietZoneSchema.safeParse(raw.quietZone)
  if (quietZone.success) sanitized.quietZone = quietZone.data

  const stylePreset = z.enum(qrStylePresetValues).safeParse(raw.stylePreset)
  if (stylePreset.success) sanitized.stylePreset = stylePreset.data

  return sanitized
}

export function sanitizeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  return colorSchema.safeParse(value).success ? value : fallback
}

export function resolveQrBranding(input: {
  orgOverride?: QrBrandingOverride | null
  tourOverride?: QrBrandingOverride | null
  stopOverride?: QrBrandingOverride | null
  logoStoragePath?: string | null
}): EffectiveQrBranding {
  const orgOverride = sanitizeQrBrandingOverride(input.orgOverride)
  const tourOverride = sanitizeQrBrandingOverride(input.tourOverride)
  const stopOverride = sanitizeQrBrandingOverride(input.stopOverride)

  const source: QrBrandingSource =
    Object.keys(stopOverride).length > 0
      ? 'stop'
      : Object.keys(tourOverride).length > 0
        ? 'tour'
        : Object.keys(orgOverride).length > 0
          ? 'organization'
          : 'system'

  const effective: QrBrandingConfig = {
    fgColor: sanitizeColor(
      stopOverride.fgColor ?? tourOverride.fgColor ?? orgOverride.fgColor,
      DEFAULT_QR_BRANDING.fgColor,
    ),
    bgColor: sanitizeColor(
      stopOverride.bgColor ?? tourOverride.bgColor ?? orgOverride.bgColor,
      DEFAULT_QR_BRANDING.bgColor,
    ),
    includeLogo:
      stopOverride.includeLogo ??
      tourOverride.includeLogo ??
      orgOverride.includeLogo ??
      DEFAULT_QR_BRANDING.includeLogo,
    logoSizeRatio:
      stopOverride.logoSizeRatio ??
      tourOverride.logoSizeRatio ??
      orgOverride.logoSizeRatio ??
      DEFAULT_QR_BRANDING.logoSizeRatio,
    quietZone:
      stopOverride.quietZone ?? tourOverride.quietZone ?? orgOverride.quietZone ?? DEFAULT_QR_BRANDING.quietZone,
    stylePreset:
      stopOverride.stylePreset ??
      tourOverride.stylePreset ??
      orgOverride.stylePreset ??
      DEFAULT_QR_BRANDING.stylePreset,
  }

  const parsedLogoRatio = logoSizeRatioSchema.safeParse(effective.logoSizeRatio)
  const parsedQuietZone = quietZoneSchema.safeParse(effective.quietZone)

  const normalized: QrBrandingConfig = {
    ...effective,
    logoSizeRatio: parsedLogoRatio.success ? parsedLogoRatio.data : DEFAULT_QR_BRANDING.logoSizeRatio,
    quietZone: parsedQuietZone.success ? parsedQuietZone.data : DEFAULT_QR_BRANDING.quietZone,
  }

  return {
    ...normalized,
    source,
    logoStoragePath: normalized.includeLogo ? (input.logoStoragePath ?? null) : null,
    hasContrastWarning: !hasGoodContrast(normalized.fgColor, normalized.bgColor),
  }
}

export function isQrBrandingOverrideEmpty(override: QrBrandingOverride): boolean {
  return Object.keys(override).length === 0
}

export function applyQrOverrideToBranding(
  base: EffectiveQrBranding,
  override: QrBrandingOverride,
  source: QrBrandingSource,
): EffectiveQrBranding {
  const sanitized = sanitizeQrBrandingOverride(override)
  const fgColor = sanitizeColor(sanitized.fgColor, base.fgColor)
  const bgColor = sanitizeColor(sanitized.bgColor, base.bgColor)
  const includeLogo = sanitized.includeLogo ?? base.includeLogo
  const logoSizeRatio = sanitized.logoSizeRatio ?? base.logoSizeRatio
  const quietZone = sanitized.quietZone ?? base.quietZone
  const stylePreset = sanitized.stylePreset ?? base.stylePreset

  return {
    fgColor,
    bgColor,
    includeLogo,
    logoSizeRatio,
    quietZone,
    stylePreset,
    source,
    logoStoragePath: includeLogo ? base.logoStoragePath : null,
    hasContrastWarning: !hasGoodContrast(fgColor, bgColor),
  }
}
