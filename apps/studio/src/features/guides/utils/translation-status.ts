import type { LocaleDraftInfo } from '@valguide/core/features/guides/guide/get-guide-detail'
import type { StopLocaleDraftInfo } from '@valguide/core/features/guides/stop/get-stop-detail'

export type TranslationLocaleStatus = 'published' | 'draft' | 'empty' | 'modified'

export type LocaleStatusMap = Record<string, TranslationLocaleStatus>

export function getTranslationLocaleStatus(
  locale: LocaleDraftInfo | StopLocaleDraftInfo | undefined,
  isLocaleAvailable?: boolean,
): TranslationLocaleStatus {
  if (!locale) {
    return isLocaleAvailable ? 'draft' : 'empty'
  }

  if (!locale.publishedVersionId) {
    return 'draft'
  }

  if (locale.hasUnpublishedChanges) {
    return 'modified'
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
