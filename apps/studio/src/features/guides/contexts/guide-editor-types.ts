import type { Asset } from '@valguide/core/features/assets/schema'
import type { GuideDetail, LocaleDraftInfo } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft.fn'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { createContext, useContext } from 'react'

// Re-export types for consumers
export type { GuideDetail, LocaleDraftInfo, GuideLocaleDraftResult, StructureDraftStop }

export type FormValues = { title?: string; description?: string | null; transcription?: string | null }
export type FormValueGetter = () => FormValues

export interface GuideEditorContextValue {
  // Core identifiers
  nanoId: string
  guideId: string

  // Locale management (synced to URL)
  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void
  updateAvailableLocales: (locales: string[]) => Promise<void>

  // Data accessors (from React Query cache)
  guideDetail: GuideDetail
  localeDraft: GuideLocaleDraftResult | null
  isLoadingLocale: boolean

  // Stop operations - uses stopNanoId for identification
  stops: StructureDraftStop[]
  addStop: () => Promise<StructureDraftStop | null>
  removeStop: (stopNanoId: string) => Promise<void>
  reorderStops: (stopNanoIds: string[]) => Promise<void>

  // Guide asset state (from React Query cache)
  guideAssets: AssetWithRole[]
  isLoadingGuideAssets: boolean

  // Guide asset operations (immediate server calls)
  setGuideCover: (asset: Asset | null) => Promise<void>

  // Stop asset operations (immediate server calls)
  getStopAssets: (stopNanoId: string) => AssetWithRole[]
  updateStopAssets: (stopNanoId: string, assets: AssetWithRole[]) => Promise<void>
  addStopAsset: (stopNanoId: string, asset: Asset, role: string, locale: string | null) => Promise<void>
  removeStopAsset: (stopNanoId: string, assetId: string) => Promise<void>

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

export const GuideEditorContext = createContext<GuideEditorContextValue | null>(null)

export function useGuideEditor() {
  const context = useContext(GuideEditorContext)
  if (!context) {
    throw new Error('useGuideEditor must be used within GuideEditorProvider')
  }
  return context
}

export function useGuideEditorOptional() {
  return useContext(GuideEditorContext)
}
