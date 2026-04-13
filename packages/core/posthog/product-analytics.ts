export const STUDIO_POSTHOG_APP = 'studio' as const
export const POSTHOG_ORGANIZATION_GROUP = 'organization' as const

export type StudioProductEventName =
  | 'auth.otp_requested'
  | 'auth.otp_verified'
  | 'org.created'
  | 'org.invite_sent'
  | 'org.invite_resent'
  | 'org.invite_canceled'
  | 'org.joined'
  | 'org.switched'
  | 'org.member_removed'
  | 'org.member_role_updated'
  | 'org.name_updated'
  | 'org.slug_updated'
  | 'org.logo_updated'
  | 'tour.created'
  | 'tour.published'
  | 'tour.unpublished'
  | 'tour.locale_added'
  | 'tour.locale_removed'
  | 'tour.saved'
  | 'tour.discarded'
  | 'tour.archived'
  | 'tour.recovered'
  | 'tour.deleted'
  | 'tour.slug_updated'
  | 'tour.settings_updated'
  | 'tour.settings_published'
  | 'tour.stop_added'
  | 'tour.stop_removed'
  | 'tour.stops_reordered'
  | 'tour.stop_hidden'
  | 'tour.stop_shown'
  | 'tour.asset_removed'
  | 'tour.asset_reordered'
  | 'stop.created'
  | 'stop.published'
  | 'stop.unpublished'
  | 'stop.locale_added'
  | 'stop.locale_removed'
  | 'stop.saved'
  | 'stop.discarded'
  | 'stop.archived'
  | 'stop.recovered'
  | 'stop.deleted'
  | 'stop.settings_updated'
  | 'stop.settings_published'
  | 'stop.asset_removed'
  | 'stop.asset_reordered'
  | 'asset.upload_completed'
  | 'asset.attached'
  | 'asset.renamed'
  | 'asset.deleted'
  | 'asset.bulk_deleted'
  | 'theme.created'
  | 'theme.updated'
  | 'theme.deleted'
  | 'theme.duplicated'
  | 'theme.default_set'
  | 'theme.default_cleared'
  | 'theme.assigned_to_tour'
  | 'theme.unassigned_from_tour'
  | 'qr.organization_branding_updated'
  | 'qr.tour_branding_updated'
  | 'qr.stop_branding_updated'
  | 'profile.updated'
  | 'profile.avatar_updated'
  | 'editor.diff_toggled'
  | 'editor.undo'
  | 'editor.redo'
  | 'editor.format_applied'
  | 'navigation.view_in_app_clicked'
  | 'qr.link_copied'
  | 'qr.link_opened'
  | 'qr.downloaded'

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
