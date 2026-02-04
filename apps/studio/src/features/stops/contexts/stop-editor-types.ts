import type { Asset } from '@valguide/core/features/assets/types'
import type { StopAssetDraftItem } from '@valguide/core/features/tours/stop/asset/get-stop-assets-draft.fn'
import type { StopAssetPublishedItem } from '@valguide/core/features/tours/stop/asset/get-stop-assets-published.fn'
import type { StopDetail } from '@valguide/core/features/tours/stop/get-stop-detail.fn'
import type { StopTourUsageResult } from '@valguide/core/features/tours/stop/get-stop-tour-usage.fn'
import type { StopLocaleDraftResult } from '@valguide/core/features/tours/stop/locale/get-stop-locale-draft.fn'
import type { StopLocalePublishedResult } from '@valguide/core/features/tours/stop/locale/get-stop-locale-published.fn'
import { createContext, useContext } from 'react'

// Re-export types for consumers
export type { StopDetail, StopLocaleDraftResult, StopLocalePublishedResult }

export type FormValues = { title?: string; description?: string | null; transcription?: string | null }
export type FormValueGetter = () => FormValues

export interface StopEditorNavigation {
  backPath: string
  backLabel: string
  backParams?: Record<string, string>
}

export interface StopEditorContextValue {
  // Core identifiers
  nanoId: string
  stopId: string

  /** Whether editing within a tour context (vs standalone stop library) */
  isInTourContext: boolean

  // Locale management (synced to URL)
  activeLocale: string
  /** Effective available locales (tour's locales in tour context, existing locales standalone) */
  availableLocales: string[]
  /** Locales that have stopLocale records (translations created for this stop) */
  existingLocales: string[]
  setActiveLocale: (locale: string) => void
  updateAvailableLocales: (locales: string[]) => Promise<void>

  // Data accessors (from React Query cache)
  stopDetail: StopDetail
  localeDraft: StopLocaleDraftResult | null
  isLoadingLocale: boolean
  localePublished: StopLocalePublishedResult | null
  isLoadingLocalePublished: boolean

  // Asset state (from React Query cache)
  assets: StopAssetDraftItem[]
  isLoadingAssets: boolean
  assetsPublished: StopAssetPublishedItem[]
  isLoadingAssetsPublished: boolean

  // Asset operations (immediate server calls)
  updateAssets: (assets: StopAssetDraftItem[]) => Promise<void>
  addAsset: (asset: Asset, channel: string, locale: string | null) => Promise<void>
  removeAsset: (assetId: string) => Promise<void>

  // Tour usage (for shared stop indicator)
  tourUsage: StopTourUsageResult | null
  isLoadingTourUsage: boolean

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

  // Publishing actions (per-locale)
  publish: (locale: string) => Promise<void>
  unpublish: (locale: string) => Promise<void>

  // Refetch data
  refetch: () => Promise<void>

  // Navigation context
  navigation: StopEditorNavigation
}

export const StopEditorContext = createContext<StopEditorContextValue | null>(null)

export function useStopEditor() {
  const context = useContext(StopEditorContext)
  if (!context) {
    throw new Error('useStopEditor must be used within StopEditorProvider')
  }
  return context
}

export function useStopEditorOptional() {
  return useContext(StopEditorContext)
}
