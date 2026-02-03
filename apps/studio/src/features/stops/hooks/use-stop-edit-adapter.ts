import type { StopAssetDraftItem } from '@valguide/core/features/tours/stop/asset/get-stop-assets-draft.fn'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'

type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }

// Simplified stop locale data using new schema
export type StopLocaleData = {
  title: string | null
  description: string | null
  transcription: string | null
  hasPublished: boolean
}

export interface StopEditAdapter {
  stopId: string
  stopNanoId: string
  tourNanoId: string | null

  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void

  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  isLoading: boolean

  // Stop content from locale draft
  stopLocaleData: StopLocaleData | null
  assets: StopAssetDraftItem[]

  save: () => Promise<void>
  refetch: () => Promise<void>
  updateAssets: (assets: StopAssetDraftItem[]) => Promise<void>
  registerFormDirty: (formId: string, isDirty: boolean, getValues?: FormValueGetter) => void
  unregisterForm: (formId: string) => void
  registerFormReset: (formId: string, resetFn: () => void) => void

  publish: (locale: string) => Promise<void>
  unpublish: (locale: string) => Promise<void>

  backPath: string
  backLabel: string
}

/**
 * Adapter hook that provides a unified interface for stop editing
 * Requires StopEditorContext
 */
export function useStopEditAdapter(): StopEditAdapter {
  const stopCtx = useStopEditor()

  return {
    stopId: stopCtx.stopId,
    stopNanoId: stopCtx.nanoId,
    tourNanoId: null,

    activeLocale: stopCtx.activeLocale,
    availableLocales: stopCtx.availableLocales,
    setActiveLocale: stopCtx.setActiveLocale,

    isDirty: stopCtx.isDirty,
    isSaving: stopCtx.isSaving,
    lastSaved: stopCtx.lastSaved,
    isLoading: stopCtx.isLoadingLocale,

    stopLocaleData: stopCtx.localeDraft
      ? {
          title: stopCtx.localeDraft.title,
          description: stopCtx.localeDraft.description,
          transcription: stopCtx.localeDraft.transcription,
          hasPublished: stopCtx.localeDraft.hasPublished,
        }
      : null,
    assets: stopCtx.assets,

    save: stopCtx.save,
    refetch: stopCtx.refetch,
    updateAssets: stopCtx.updateAssets,
    registerFormDirty: stopCtx.registerFormDirty,
    unregisterForm: stopCtx.unregisterForm,
    registerFormReset: stopCtx.registerFormReset,

    publish: stopCtx.publish,
    unpublish: stopCtx.unpublish,

    backPath: stopCtx.navigation.backPath,
    backLabel: stopCtx.navigation.backLabel,
  }
}
