import type { AssetWithRole, StopTranslationVersionContent } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { useMemo } from 'react'
import { useGuideEditorOptional } from '@/features/guides/contexts/guide-editor-types'
import { useStopEditorOptional } from '@/features/stops/contexts/stop-editor-types'

// Type for form value getters
type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }

// Translation data structure matching StopEditLayout expectations
export type StopTranslationData = {
  stopId: string
  translationId: string
  currentVersionId: string | null
  draftVersionId: string | null
  currentVersion: StopTranslationVersionContent | null
  draftVersion: StopTranslationVersionContent | null
}

export interface StopEditAdapter {
  // Core identifiers
  stopId: string
  stopNanoId: string
  guideNanoId: string | null // Only present in guide context

  // Locale management
  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void

  // State
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  isLoading: boolean

  // Data
  stopTranslation: StopTranslationData | null
  assets: AssetWithRole[]

  // Actions
  save: () => Promise<void>
  refetch: () => Promise<void>
  updateAssets: (assets: AssetWithRole[]) => void
  registerFormDirty: (formId: string, isDirty: boolean, getValues?: FormValueGetter) => void
  unregisterForm: (formId: string) => void
  registerFormReset: (formId: string, resetFn: () => void, saveResetFn?: () => void) => void

  // Publishing (stop-level)
  publish: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  unpublish: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  discard: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>

  // Navigation context
  backPath: string
  backLabel: string
}

/**
 * Adapter hook that provides a unified interface for stop editing
 * Works with either GuideEditorContext or StopEditorContext
 */
export function useStopEditAdapter(stopNanoId: string): StopEditAdapter {
  const t = useTranslations()
  const guideCtx = useGuideEditorOptional()
  const stopCtx = useStopEditorOptional()

  // Get the stop metadata from guide context
  const stopMetadataFromGuide = useMemo(() => {
    if (!guideCtx?.metadata) return null
    return guideCtx.metadata.stops.find((s) => s.nanoId === stopNanoId)
  }, [guideCtx?.metadata, stopNanoId])

  // Get the stop translation from guide context
  const stopTranslationFromGuide = useMemo(() => {
    if (!guideCtx?.localeData || !stopMetadataFromGuide) return null
    return guideCtx.localeData.stopTranslations.find((st) => st.stopId === stopMetadataFromGuide.id) ?? null
  }, [guideCtx?.localeData, stopMetadataFromGuide])

  // Get the stop translation from stop context
  const stopTranslationFromStop = useMemo(() => {
    if (!stopCtx?.localeData?.stopTranslation || !stopCtx.stopId) return null
    const { stopTranslation } = stopCtx.localeData
    return {
      stopId: stopCtx.stopId,
      translationId: stopTranslation.translationId,
      currentVersionId: stopTranslation.currentVersionId,
      draftVersionId: stopTranslation.draftVersionId,
      currentVersion: stopTranslation.currentVersion,
      draftVersion: stopTranslation.draftVersion,
    }
  }, [stopCtx?.localeData, stopCtx?.stopId])

  if (guideCtx && stopMetadataFromGuide) {
    // Guide context adapter
    return {
      stopId: stopMetadataFromGuide.id,
      stopNanoId,
      guideNanoId: guideCtx.nanoId,

      activeLocale: guideCtx.activeLocale,
      availableLocales: guideCtx.availableLocales,
      setActiveLocale: guideCtx.setActiveLocale,

      isDirty: guideCtx.isDirty,
      isSaving: guideCtx.isSaving,
      lastSaved: guideCtx.lastSaved,
      isLoading: guideCtx.isLoadingLocale,

      stopTranslation: stopTranslationFromGuide,
      assets: guideCtx.getStopAssets(stopMetadataFromGuide.id),

      save: guideCtx.save,
      refetch: guideCtx.refetch,
      updateAssets: (assets: AssetWithRole[]) => guideCtx.updateStopAssets(stopMetadataFromGuide.id, assets),
      registerFormDirty: guideCtx.registerFormDirty,
      unregisterForm: guideCtx.unregisterForm,
      registerFormReset: guideCtx.registerFormReset,

      // In guide context, publish/unpublish/discard are passed from the route
      // The adapter just provides the interface - actual implementations come from props
      publish: async () => ({ success: false, error: 'Use route-provided publish function' }),
      unpublish: async () => ({ success: false, error: 'Use route-provided unpublish function' }),
      discard: async () => ({ success: false, error: 'Use route-provided discard function' }),

      backPath: `/guides/${guideCtx.nanoId}/edit`,
      backLabel: t('guides.editor.backToGuide'),
    }
  }

  if (stopCtx) {
    // Stop context adapter
    return {
      stopId: stopCtx.stopId,
      stopNanoId: stopCtx.nanoId,
      guideNanoId: null,

      activeLocale: stopCtx.activeLocale,
      availableLocales: stopCtx.availableLocales,
      setActiveLocale: stopCtx.setActiveLocale,

      isDirty: stopCtx.isDirty,
      isSaving: stopCtx.isSaving,
      lastSaved: stopCtx.lastSaved,
      isLoading: stopCtx.isLoadingLocale,

      stopTranslation: stopTranslationFromStop,
      assets: stopCtx.assets,

      save: stopCtx.save,
      refetch: stopCtx.refetch,
      updateAssets: stopCtx.updateAssets,
      registerFormDirty: stopCtx.registerFormDirty,
      unregisterForm: stopCtx.unregisterForm,
      registerFormReset: stopCtx.registerFormReset,

      publish: async (_stopId: string, locale: string) => {
        try {
          await stopCtx.publish(locale)
          return { success: true }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      },
      unpublish: async (_stopId: string, locale: string) => {
        try {
          await stopCtx.unpublish(locale)
          return { success: true }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      },
      discard: async (_stopId: string, locale: string) => {
        try {
          await stopCtx.discard(locale)
          return { success: true }
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      },

      backPath: stopCtx.backPath,
      backLabel: stopCtx.backLabel,
    }
  }

  throw new Error('useStopEditAdapter must be used within GuideEditorProvider or StopEditorProvider')
}
