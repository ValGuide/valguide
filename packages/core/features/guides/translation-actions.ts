'use server'

import {
  publishGuideTranslationDraft as publishDraft,
  publishStopTranslationDraft as publishStopDraft,
  rollbackGuideTranslation as rollbackGuide,
  rollbackStopTranslation as rollbackStop,
} from './translation-mutations'
import {
  getGuideTranslationHistory as getHistory,
  getStopTranslationHistory as getStopHistory,
} from './translation-queries'

export async function publishGuideTranslationDraft(guideId: string, locale: string) {
  return publishDraft(guideId, locale)
}

export async function publishStopTranslationDraft(stopId: string, locale: string) {
  return publishStopDraft(stopId, locale)
}

export async function rollbackGuideTranslation(guideId: string, locale: string, targetVersion: number, userId?: string) {
  return rollbackGuide(guideId, locale, targetVersion, userId)
}

export async function rollbackStopTranslation(stopId: string, locale: string, targetVersion: number, userId?: string) {
  return rollbackStop(stopId, locale, targetVersion, userId)
}

export async function getGuideTranslationHistory(guideId: string, locale: string) {
  return getHistory(guideId, locale)
}

export async function getStopTranslationHistory(stopId: string, locale: string) {
  return getStopHistory(stopId, locale)
}
