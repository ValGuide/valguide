import type { Asset } from '@valguide/core/features/assets/schema'
import type { AssetWithRole, GuideLocaleData, GuideMetadata, StopMetadata } from '@valguide/core/features/guides/types'
import { createContext, useContext } from 'react'

// Type for form value getters
type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }

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
  metadata: GuideMetadata | null
  localeData: GuideLocaleData | null
  isLoadingLocale: boolean

  // Stop operations
  stops: StopMetadata[]
  addStop: () => Promise<StopMetadata | null>
  deleteStop: (stopId: string) => Promise<void>
  reorderStops: (stops: Array<{ id: string; order: number }>) => Promise<void>

  // Asset state (in-memory, saved on save())
  guideAssets: AssetWithRole[]
  getStopAssets: (stopId: string) => AssetWithRole[]

  // Asset operations (update in-memory state, saved on save())
  setGuideCover: (asset: Asset | null) => void
  updateStopAssets: (stopId: string, assets: AssetWithRole[]) => void
  addStopAsset: (stopId: string, asset: Asset, role: string, locale: string | null) => void
  removeStopAsset: (stopId: string, assetId: string) => void

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

export const GuideEditorContext = createContext<GuideEditorContextValue | null>(null)

export function useGuideEditor() {
  const context = useContext(GuideEditorContext)
  if (!context) {
    throw new Error('useGuideEditor must be used within GuideEditorProvider')
  }
  return context
}
