import { useQuery } from '@tanstack/react-query'
import type {
  GuideLocaleData,
  GuideMetadata,
  StopTranslationVersionContent,
} from '@valguide/core/features/guides/types'
import { guideLocaleQueryOptions, guideMetadataQueryOptions } from '../query-options'

interface UseGuideEditorDataOptions {
  nanoId: string
  locale: string
  enabled?: boolean
}

interface UseGuideEditorDataReturn {
  metadata: ReturnType<typeof useQuery<GuideMetadata | null>>
  localeData: ReturnType<typeof useQuery<GuideLocaleData>>
  isLoading: boolean
  error: Error | null
}

/**
 * Adapter hook for guide editor data
 * Fetches metadata (stops, assets) and locale-specific translations separately
 * This minimizes data fetching - only ONE locale is loaded at a time
 */
export function useGuideEditorData({
  nanoId,
  locale,
  enabled = true,
}: UseGuideEditorDataOptions): UseGuideEditorDataReturn {
  const metadata = useQuery({
    ...guideMetadataQueryOptions(nanoId),
    enabled,
  })

  const guideId = metadata.data?.id

  const localeData = useQuery({
    ...guideLocaleQueryOptions(guideId!, locale),
    enabled: enabled && !!guideId,
  })

  return {
    metadata,
    localeData,
    isLoading: metadata.isLoading || (!!guideId && localeData.isLoading),
    error: metadata.error ?? localeData.error ?? null,
  }
}

/**
 * Get guide translation for the active locale from localeData
 */
export function selectGuideTranslation(localeData: GuideLocaleData | undefined) {
  return localeData?.guideTranslation ?? null
}

/**
 * Get stop translation for a specific stop from localeData
 */
export function selectStopTranslation(localeData: GuideLocaleData | undefined, stopId: string) {
  return localeData?.stopTranslations.find((st) => st.stopId === stopId) ?? null
}

/**
 * Get stop assets for a specific stop from metadata
 */
export function selectStopAssets(metadata: GuideMetadata | undefined, stopId: string) {
  return metadata?.stops.find((s) => s.id === stopId)?.assets ?? []
}

/**
 * Get the display version data for guide translation (draft or published)
 */
export function selectGuideDisplayVersion(
  localeData: GuideLocaleData | undefined,
  preferDraft: boolean = true,
): { title: string; description: string | null } | null {
  const translation = localeData?.guideTranslation
  if (!translation) return null

  if (preferDraft && translation.draftVersion) {
    return {
      title: translation.draftVersion.title,
      description: translation.draftVersion.description,
    }
  }

  if (translation.currentVersion) {
    return {
      title: translation.currentVersion.title,
      description: translation.currentVersion.description,
    }
  }

  return null
}

/**
 * Get the display version data for stop translation (draft or published)
 */
export function selectStopDisplayVersion(
  localeData: GuideLocaleData | undefined,
  stopId: string,
  preferDraft: boolean = true,
): StopTranslationVersionContent | null {
  const stopTranslation = selectStopTranslation(localeData, stopId)
  if (!stopTranslation) return null

  if (preferDraft && stopTranslation.draftVersion) {
    return stopTranslation.draftVersion
  }

  return stopTranslation.currentVersion
}
