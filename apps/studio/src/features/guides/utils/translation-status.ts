import type { LocaleDraftInfo } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { StopLocaleDraftInfo } from '@valguide/core/features/guides/stop/get-stop-detail.fn'

export type TranslationLocaleStatus = 'published' | 'draft' | 'empty'

export type LocaleStatusMap = Record<string, TranslationLocaleStatus>

export function getTranslationLocaleStatus(
  locale: LocaleDraftInfo | StopLocaleDraftInfo | undefined,
  isLocaleAvailable?: boolean,
): TranslationLocaleStatus {
  if (!locale) {
    return isLocaleAvailable ? 'draft' : 'empty'
  }

  if (!locale.hasPublished) {
    return 'draft'
  }

  return 'published'
}

export function getLocaleStatusMapFromDrafts(
  drafts: (LocaleDraftInfo | StopLocaleDraftInfo)[] | undefined,
  locales: string[],
): LocaleStatusMap {
  const statusMap: LocaleStatusMap = {}
  for (const locale of locales) {
    const draft = drafts?.find((d) => d.locale === locale)
    statusMap[locale] = getTranslationLocaleStatus(draft, true)
  }
  return statusMap
}
