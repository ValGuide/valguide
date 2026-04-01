import type { ShortLinkTarget } from './schema'

export type CreateTourShortLink = {
  type: 'tour'
  tourNanoId: string
  target?: ShortLinkTarget
}

export type CreateStopShortLink = {
  type: 'stop'
  tourNanoId: string
  stopNanoId: string
  target?: ShortLinkTarget
}

export type CreateCampaignShortLink = {
  type: 'campaign'
  campaignId: string
  target?: ShortLinkTarget
}

export type CreateExternalShortLink = {
  type: 'external'
  externalUrl: string
  target?: ShortLinkTarget
}

export type CreateLandingPageShortLink = {
  type: 'landing_page'
  pageSlug: string
  locale: string
  target?: ShortLinkTarget
}

export type CreateShortLinkInput =
  | CreateTourShortLink
  | CreateStopShortLink
  | CreateCampaignShortLink
  | CreateExternalShortLink
  | CreateLandingPageShortLink
