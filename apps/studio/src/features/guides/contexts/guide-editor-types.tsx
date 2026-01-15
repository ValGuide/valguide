import type { Asset } from '@valguide/core/features/assets/schema'
import type { GuideWithStopsAndAssets, StopWithAssets } from '@valguide/core/features/guides/types'
import { createContext, useContext } from 'react'

type ContentLocale = string

export interface GuideEditorContextValue {
  // State
  guide: GuideWithStopsAndAssets
  activeLocale: ContentLocale
  selectedStop: StopWithAssets | null
  isDirty: boolean
  isSaving: boolean

  // Guide actions
  updateGuideAvailableLocales: (locales: string[]) => Promise<void>

  // Guide asset actions
  attachAssetToGuide: (asset: Asset, role: string) => Promise<void>
  detachAssetFromGuide: (assetId: string, guideAssetId: string) => Promise<void>

  // Stop actions
  selectStop: (stop: StopWithAssets | null) => void
  addStop: () => Promise<StopWithAssets | null>
  deleteStop: (stopId: string) => Promise<void>
  reorderStops: (stops: StopWithAssets[]) => Promise<void>

  // Stop asset actions
  attachAssetToStop: (stopId: string, asset: Asset, role: string, locale?: string | null) => Promise<void>
  detachAssetFromStop: (stopId: string, assetId: string, stopAssetId: string) => Promise<void>

  // Locale actions
  setActiveLocale: (locale: ContentLocale) => void

  // Save actions
  save: () => Promise<void>
  publish: () => Promise<void>

  // Refetch data from server
  refetch: () => Promise<void>

  // Form dirty registration
  registerFormDirty: (formId: string, isDirty: boolean) => void
  unregisterForm: (formId: string) => void
  resetAllForms: () => void
  registerFormReset: (formId: string, resetFn: () => void, saveResetFn?: () => void) => void

  // Metadata
  lastSaved: Date | null
}

export const GuideEditorContext = createContext<GuideEditorContextValue | null>(null)

export function useGuideEditor() {
  const context = useContext(GuideEditorContext)
  if (!context) {
    throw new Error('useGuideEditor must be used within GuideEditorProvider')
  }
  return context
}
