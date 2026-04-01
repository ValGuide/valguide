export const STUDIO_POSTHOG_APP = 'studio' as const
export const POSTHOG_ORGANIZATION_GROUP = 'organization' as const

export type StudioProductEventName =
  | 'auth.otp_requested'
  | 'auth.otp_verified'
  | 'org.created'
  | 'org.invite_sent'
  | 'org.joined'
  | 'org.switched'
  | 'tour.created'
  | 'tour.published'
  | 'tour.locale_added'
  | 'tour.saved'
  | 'stop.created'
  | 'stop.locale_added'
  | 'stop.saved'
  | 'asset.upload_completed'
  | 'asset.attached'
  | 'theme.updated'

export type StudioAnalyticsOrganization = {
  nanoId: string
  name?: string | null
  slug?: string | null
  role?: string | null
}

export type StudioAnalyticsProperties = Record<string, unknown>

function omitUndefined(properties: StudioAnalyticsProperties): StudioAnalyticsProperties {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined))
}

export function buildStudioAnalyticsProperties(
  properties: StudioAnalyticsProperties = {},
  organization?: StudioAnalyticsOrganization | null,
): StudioAnalyticsProperties {
  return omitUndefined({
    app: STUDIO_POSTHOG_APP,
    organization_nano_id: organization?.nanoId,
    organization_slug: organization?.slug,
    organization_role: organization?.role,
    ...properties,
  })
}

export function buildStudioPersonProperties(input: {
  role?: string | null
  approvedStatus?: string | null
}): StudioAnalyticsProperties {
  return omitUndefined({
    app: STUDIO_POSTHOG_APP,
    user_role: input.role,
    approved_status: input.approvedStatus,
  })
}

export function buildStudioOrganizationProperties(
  organization: StudioAnalyticsOrganization,
): StudioAnalyticsProperties {
  return omitUndefined({
    app: STUDIO_POSTHOG_APP,
    organization_nano_id: organization.nanoId,
    organization_name: organization.name,
    organization_slug: organization.slug,
    organization_role: organization.role,
  })
}

export function getFileSizeBucket(fileSize: number): string {
  if (fileSize < 1_000_000) return 'lt_1mb'
  if (fileSize < 10_000_000) return '1mb_to_10mb'
  if (fileSize < 50_000_000) return '10mb_to_50mb'
  if (fileSize < 100_000_000) return '50mb_to_100mb'
  return 'gte_100mb'
}
