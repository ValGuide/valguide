import type { Asset } from '@valguide/core/features/assets/schema'
import type { AssetWithRole, IndependentStopMetadata, StopLocaleData } from '@valguide/core/features/guides/types'
import { createContext, useContext } from 'react'

// Type for form value getters
type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }

export interface StopEditorContextValue {
  // Core identifiers
  nanoId: string
  stopId: string

  // Locale management (synced to URL)
  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void
  updateAvailableLocales: (locales: string[]) => Promise<void>

  // Data accessors (from React Query cache)
  metadata: IndependentStopMetadata | null
  localeData: StopLocaleData | null
  isLoadingLocale: boolean

  // Asset state (in-memory, saved on save())
  assets: AssetWithRole[]

  // Asset operations (update in-memory state, saved on save())
  updateAssets: (assets: AssetWithRole[]) => void
  addAsset: (asset: Asset, role: string, locale: string | null) => void
  removeAsset: (assetId: string) => void

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

  // Publishing actions (per-locale)
  publish: (locale: string) => Promise<void>
  unpublish: (locale: string) => Promise<void>
  discard: (locale: string) => Promise<void>

  // Refetch data
  refetch: () => Promise<void>

  // Navigation context
  backPath: string
  backLabel: string
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
