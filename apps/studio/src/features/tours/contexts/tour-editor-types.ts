import type { Asset } from '@valguide/core/features/assets/types'
import type { TourAssetDraftItem } from '@valguide/core/features/tours/tour/asset/get-tour-assets-draft.fn'
import type { TourAssetPublishedItem } from '@valguide/core/features/tours/tour/asset/get-tour-assets-published.fn'
import type { LocaleDraftInfo, TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import type { TourLocaleDraftResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-draft.fn'
import type { TourLocalePublishedResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-published.fn'
import { createContext, useContext } from 'react'

// Re-export types for consumers
export type { TourDetail, LocaleDraftInfo, TourLocaleDraftResult, TourLocalePublishedResult }

export type FormValues = { title?: string; description?: string | null }
export type FormValueGetter = () => FormValues

export interface TourEditorNavigation {
  backPath: string
  backLabel: string
}

export interface TourEditorContextValue {
  // Core identifiers
  nanoId: string
  tourId: string

  // Navigation (for back button)
  navigation: TourEditorNavigation

  // Locale management (synced to URL)
  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void
  updateAvailableLocales: (locales: string[]) => Promise<void>

  // Data accessors (from React Query cache)
  tourDetail: TourDetail
  localeDraft: TourLocaleDraftResult | null
  isLoadingLocale: boolean
  localePublished: TourLocalePublishedResult | null
  isLoadingLocalePublished: boolean

  // Tour asset state (from React Query cache)
  tourAssets: TourAssetDraftItem[]
  isLoadingTourAssets: boolean
  tourAssetsPublished: TourAssetPublishedItem[]
  isLoadingTourAssetsPublished: boolean

  // Tour asset operations (immediate server calls)
  setTourCover: (asset: Asset | null) => Promise<void>

  // Form dirty registration
  isDirty: boolean
  registerFormDirty: (formId: string, isDirty: boolean, getValues?: FormValueGetter) => void
  unregisterForm: (formId: string) => void
  registerFormReset: (formId: string, resetFn: () => void) => void
  resetAllForms: () => void

  // Save orchestration
  save: () => Promise<void>
  isSaving: boolean
  lastSaved: Date | null

  // Publish actions
  publish: () => Promise<void>

  // Refetch data
  refetch: () => Promise<void>
}

export const TourEditorContext = createContext<TourEditorContextValue | null>(null)

export function useTourEditor() {
  const context = useContext(TourEditorContext)
  if (!context) {
    throw new Error('useTourEditor must be used within TourEditorProvider')
  }
  return context
}
