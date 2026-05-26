import type { ShortLinkTarget } from './schema'

type CreateShortLinkBase = {
  organizationId?: string | null
  title?: string | null
  description?: string | null
  context?: string | null
  expiresAt?: Date | null
  createdBy?: string | null
  updatedBy?: string | null
}

export type CreateTourShortLink = {
  type: 'tour'
  tourNanoId: string
  target?: ShortLinkTarget
} & CreateShortLinkBase

export type CreateStopShortLink = {
  type: 'stop'
  tourNanoId: string
  stopNanoId: string
  target?: ShortLinkTarget
} & CreateShortLinkBase

export type CreateCampaignShortLink = {
  type: 'campaign'
  campaignId: string
  target?: ShortLinkTarget
} & CreateShortLinkBase

export type CreateExternalShortLink = {
  type: 'external'
  externalUrl: string
  target?: ShortLinkTarget
} & CreateShortLinkBase

export type CreateLandingPageShortLink = {
  type: 'landing_page'
  pageSlug: string
  locale: string
  target?: ShortLinkTarget
} & CreateShortLinkBase

export type CreateShortLinkInput =
  | CreateTourShortLink
  | CreateStopShortLink
  | CreateCampaignShortLink
  | CreateExternalShortLink
  | CreateLandingPageShortLink
