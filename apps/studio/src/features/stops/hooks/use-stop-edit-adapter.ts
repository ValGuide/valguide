import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { useMemo } from 'react'
import { useGuideEditorOptional } from '@/features/guides/contexts/guide-editor-types'
import { useStopEditorOptional } from '@/features/stops/contexts/stop-editor-types'

type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }

// Simplified stop locale data using new schema
export type StopLocaleData = {
  title: string | null
  description: string | null
  transcription: string | null
  hasUnpublishedChanges: boolean
  publishedVersionId: string | null
}

export interface StopEditAdapter {
  stopId: string
  stopNanoId: string
  guideNanoId: string | null

  activeLocale: string
  availableLocales: string[]
  setActiveLocale: (locale: string) => void

  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  isLoading: boolean

  // Stop content from locale draft
  stopLocaleData: StopLocaleData | null
  assets: AssetWithRole[]

  save: () => Promise<void>
  refetch: () => Promise<void>
  updateAssets: (assets: AssetWithRole[]) => void
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
 * Works with either GuideEditorContext or StopEditorContext
 */
export function useStopEditAdapter(stopNanoId: string): StopEditAdapter {
  const t = useTranslations()
  const guideCtx = useGuideEditorOptional()
  const stopCtx = useStopEditorOptional()

  // Get the stop from guide context structure
  const stopFromGuide = useMemo(() => {
    if (!guideCtx?.stops) return null
    return guideCtx.stops.find((s) => s.stopNanoId === stopNanoId) ?? null
  }, [guideCtx?.stops, stopNanoId])

  if (guideCtx && stopFromGuide) {
    // Guide context adapter - stop within a guide
    return {
      stopId: stopFromGuide.stopId,
      stopNanoId,
      guideNanoId: guideCtx.nanoId,

      activeLocale: guideCtx.activeLocale,
      availableLocales: guideCtx.availableLocales,
      setActiveLocale: guideCtx.setActiveLocale,

      isDirty: guideCtx.isDirty,
      isSaving: guideCtx.isSaving,
      lastSaved: guideCtx.lastSaved,
      isLoading: guideCtx.isLoadingLocale,

      // Stop locale data from structure (limited - only has title)
      stopLocaleData: {
        title: stopFromGuide.title,
        description: null, // Not available in structure, would need separate query
        transcription: null,
        hasUnpublishedChanges: false, // Would need separate query
        publishedVersionId: null,
      },
      assets: guideCtx.getStopAssets(stopNanoId),

      save: guideCtx.save,
      refetch: guideCtx.refetch,
      updateAssets: (assets: AssetWithRole[]) => guideCtx.updateStopAssets(stopNanoId, assets),
      registerFormDirty: guideCtx.registerFormDirty,
      unregisterForm: guideCtx.unregisterForm,
      registerFormReset: guideCtx.registerFormReset,

      // In guide context, publish is handled by the guide
      publish: async () => {
        await guideCtx.publish()
      },
      unpublish: async () => {
        // Not supported in guide context
      },

      backPath: `/guides/${guideCtx.nanoId}/edit`,
      backLabel: t('guides.editor.backToGuide'),
    }
  }

  if (stopCtx) {
    // Stop context adapter - standalone stop editing
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

      stopLocaleData: stopCtx.localeDraft
        ? {
            title: stopCtx.localeDraft.title,
            description: stopCtx.localeDraft.description,
            transcription: stopCtx.localeDraft.transcription,
            hasUnpublishedChanges: stopCtx.localeDraft.hasUnpublishedChanges,
            publishedVersionId: stopCtx.localeDraft.publishedVersionId,
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

      backPath: stopCtx.backPath,
      backLabel: stopCtx.backLabel,
    }
  }

  throw new Error('useStopEditAdapter must be used within GuideEditorProvider or StopEditorProvider')
}
