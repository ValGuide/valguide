import type { Asset } from '@valguide/core/features/assets/schema'
import type { GuideLocaleData, GuideMetadata, StopMetadata } from '@valguide/core/features/guides/types'
import { createContext, useContext } from 'react'

// Type for form value getters
type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }

export interface GuideEditorV2ContextValue {
  // Core identifiers
  nanoId: string
  guideId: string

  // Locale management (synced to URL)
  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void
  updateAvailableLocales: (locales: string[]) => Promise<void>

  // Data accessors (from React Query cache)
  metadata: GuideMetadata | null
  localeData: GuideLocaleData | null
  isLoadingLocale: boolean

  // Stop operations
  stops: StopMetadata[]
  addStop: () => Promise<StopMetadata | null>
  deleteStop: (stopId: string) => Promise<void>
  reorderStops: (stops: Array<{ id: string; order: number }>) => Promise<void>

  // Asset operations (immediate save)
  attachAssetToGuide: (asset: Asset, role: string) => Promise<void>
  detachAssetFromGuide: (assetId: string, guideAssetId: string) => Promise<void>
  attachAssetToStop: (stopId: string, asset: Asset, role: string, locale?: string | null) => Promise<void>
  detachAssetFromStop: (stopId: string, assetId: string, stopAssetId: string) => Promise<void>

  // Form dirty registration
  isDirty: boolean
  registerFormDirty: (formId: string, isDirty: boolean, getValues?: FormValueGetter) => void
  unregisterForm: (formId: string) => void
  registerFormReset: (formId: string, resetFn: () => void, saveResetFn?: () => void) => void
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

export const GuideEditorV2Context = createContext<GuideEditorV2ContextValue | null>(null)

export function useGuideEditorV2() {
  const context = useContext(GuideEditorV2Context)
  if (!context) {
    throw new Error('useGuideEditorV2 must be used within GuideEditorV2Provider')
  }
  return context
}
