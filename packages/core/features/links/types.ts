import type { ShortLinkTarget } from './schema'

export type CreateGuideShortLink = {
  type: 'guide'
  guideNanoId: string
  locale: string
  target?: ShortLinkTarget
}

export type CreateStopShortLink = {
  type: 'stop'
  guideNanoId: string
  stopNanoId: string
  locale: string
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
  | CreateGuideShortLink
  | CreateStopShortLink
  | CreateCampaignShortLink
  | CreateExternalShortLink
  | CreateLandingPageShortLink
