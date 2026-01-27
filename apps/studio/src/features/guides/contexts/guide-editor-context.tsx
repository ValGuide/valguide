import { useQuery } from '@tanstack/react-query'
import type { Asset } from '@valguide/core/features/assets/schema'
import { assignGuideAssetFn } from '@valguide/core/features/guides/guide/asset/assign-guide-asset.fn'
import { removeGuideAssetFn } from '@valguide/core/features/guides/guide/asset/remove-guide-asset.fn'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import type { GuideLocalePublishedResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-published.fn'
import { publishGuideLocaleFn } from '@valguide/core/features/guides/guide/locale/publish-guide-locale.fn'
import { updateGuideLocaleDraftFn } from '@valguide/core/features/guides/guide/locale/update-guide-locale-draft.fn'
import { updateGuideFn } from '@valguide/core/features/guides/guide/update-guide.fn'
import { createStopFn } from '@valguide/core/features/guides/stop/create-stop.fn'
import { addStopToGuideFn } from '@valguide/core/features/guides/structure/add-stop.fn'
import { removeStopFromGuideFn } from '@valguide/core/features/guides/structure/remove-stop.fn'
import { reorderStopsFn } from '@valguide/core/features/guides/structure/reorder-stops.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback } from 'react'
import { useEditorBase } from '@/features/editor/hooks/use-editor-base'
import {
  guideAssetsDraftQueryOptions,
  guideAssetsPublishedQueryOptions,
  guideDetailQueryOptions,
  guideLocaleDraftQueryOptions,
  guideLocalePublishedQueryOptions,
  guideStructureDraftQueryOptions,
} from '../query-options'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

interface GuideEditorProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
  navigation?: {
    backPath: string
    backLabel: string
  }
}

export function GuideEditorProvider({ children, nanoId, initialLocale, navigation }: GuideEditorProviderProps) {
  const t = useTranslations()

  const base = useEditorBase<GuideDetail, GuideLocaleDraftResult, GuideLocalePublishedResult>({
    nanoId,
    initialLocale,
    detailQueryOptions: guideDetailQueryOptions,
    localeDraftQueryOptions: guideLocaleDraftQueryOptions,
    localePublishedQueryOptions: guideLocalePublishedQueryOptions,
  })

  const {
    entityId: guideId,
    detail: guideDetail,
    activeLocale,
    availableLocales,
    setActiveLocale,
    localeDraft,
    isLoadingLocale,
    localePublished,
    isLoadingLocalePublished,
    isDirty,
    isSaving,
    lastSaved,
    setIsSaving,
    setLastSaved,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    resetAllForms,
    resetAllFormsAfterSave,
    getFormValues,
    queryClient,
  } = base

  // Fetch stops from structure
  const structureQuery = useQuery({
    ...guideStructureDraftQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId,
  })
  const stops = structureQuery.data?.stops ?? []

  // Guide assets from server (immediate operations, no local state)
  const guideAssetsQuery = useQuery({
    ...guideAssetsDraftQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const guideAssets = guideAssetsQuery.data?.assets ?? []
  const isLoadingGuideAssets = guideAssetsQuery.isLoading

  // Published guide assets
  const guideAssetsPublishedQuery = useQuery({
    ...guideAssetsPublishedQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const guideAssetsPublished = guideAssetsPublishedQuery.data?.assets ?? []
  const isLoadingGuideAssetsPublished = guideAssetsPublishedQuery.isLoading

  // Update available locales
  const updateAvailableLocales = useCallback(
    async (locales: string[]) => {
      if (!nanoId) return
      try {
        await updateGuideFn({ data: { nanoId, availableLocales: locales } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'detail'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocale(locales[0] ?? defaultLocale)
        }

        toast.success(t('guides.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('guides.locales.updateError'))
      }
    },
    [nanoId, queryClient, activeLocale, setActiveLocale, t],
  )

  // Stop operations
  const addStop = useCallback(async () => {
    if (!nanoId) return null
    try {
      const newStop = await createStopFn({ data: { title: t('stops.newStopTitle'), locale: activeLocale } })
      await addStopToGuideFn({ data: { guideNanoId: nanoId, stopNanoId: newStop.nanoId } })
      await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'structure'] })
      const structureResult = await queryClient.fetchQuery(guideStructureDraftQueryOptions(nanoId, activeLocale))
      const addedStop = structureResult?.stops.find((s) => s.stopNanoId === newStop.nanoId)
      return addedStop ?? null
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error(t('stops.actions.addError'))
      return null
    }
  }, [nanoId, activeLocale, queryClient, t])

  const removeStop = useCallback(
    async (stopNanoId: string) => {
      if (!nanoId) return
      try {
        await removeStopFromGuideFn({ data: { guideNanoId: nanoId, stopNanoId } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'structure'] })
        toast.success(t('stops.actions.removeSuccess'))
      } catch (error) {
        console.error('Failed to remove stop:', error)
        toast.error(t('stops.actions.removeError'))
      }
    },
    [nanoId, queryClient, t],
  )

  const reorderStops = useCallback(
    async (stopOrder: string[]) => {
      if (!nanoId) return
      try {
        await reorderStopsFn({ data: { guideNanoId: nanoId, stopNanoIds: stopOrder } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'structure'] })
        toast.success(t('stops.actions.reorderSuccess'))
      } catch (error) {
        console.error('Failed to reorder stops:', error)
        toast.error(t('stops.actions.reorderError'))
      }
    },
    [nanoId, queryClient, t],
  )

  // Guide asset operations (immediate server calls)
  const setGuideCover = useCallback(
    async (asset: Asset | null) => {
      if (!nanoId) return

      try {
        const existingCovers = guideAssets.filter((a) => a.channel === 'images.hero')
        for (const cover of existingCovers) {
          await removeGuideAssetFn({
            data: { nanoId, assetId: cover.asset.id, channel: 'images.hero', locale: null },
          })
        }

        if (asset) {
          await assignGuideAssetFn({
            data: { nanoId, assetId: asset.id, channel: 'images.hero', locale: null, position: 0 },
          })
        }

        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'assets'] })
      } catch (error) {
        console.error('Failed to set guide cover:', error)
        toast.error(t('guides.assets.updateError'))
      }
    },
    [nanoId, guideAssets, queryClient, t],
  )

  // Save orchestration - only handles guide translation forms
  const save = useCallback(async () => {
    if (!isDirty || !nanoId) return

    setIsSaving(true)
    try {
      const formValues = getFormValues()
      for (const [formId, registration] of formValues.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        if (formId.startsWith('guide-translation-')) {
          await updateGuideLocaleDraftFn({
            data: {
              nanoId,
              locale: activeLocale,
              title: (values.title as string) ?? '',
              description: (values.description as string) ?? '',
            },
          })
        }
      }

      resetAllFormsAfterSave()

      await queryClient.invalidateQueries({ queryKey: ['guide', nanoId] })
      await queryClient.invalidateQueries({ queryKey: ['guides'] })

      setLastSaved(new Date())
      toast.success(t('common.saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, nanoId, activeLocale, queryClient, resetAllFormsAfterSave, getFormValues, setIsSaving, setLastSaved, t])

  // Publish locale
  const publish = useCallback(async () => {
    await save()
    if (!nanoId) return

    try {
      await publishGuideLocaleFn({ data: { nanoId, locale: activeLocale } })
      await queryClient.invalidateQueries({ queryKey: ['guide', nanoId] })
      toast.success(t('guides.publish.guidePublished'))
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('guides.publish.guidePublishError'))
    }
  }, [nanoId, activeLocale, queryClient, save, t])

  // Refetch
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['guide', nanoId] })
    resetAllForms()
  }, [nanoId, queryClient, resetAllForms])

  const defaultNavigation = { backPath: `/guides/${nanoId}`, backLabel: 'guides.editor.guideDetails' }

  const value: GuideEditorContextValue = {
    nanoId,
    guideId,
    navigation: navigation ?? defaultNavigation,
    activeLocale,
    availableLocales,
    setActiveLocale,
    updateAvailableLocales,
    guideDetail,
    localeDraft,
    isLoadingLocale,
    localePublished,
    isLoadingLocalePublished,
    stops,
    addStop,
    removeStop,
    reorderStops,
    guideAssets,
    isLoadingGuideAssets,
    guideAssetsPublished,
    isLoadingGuideAssetsPublished,
    setGuideCover,
    isDirty,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    resetAllForms,
    save,
    isSaving,
    lastSaved,
    publish,
    refetch,
  }

  return <GuideEditorContext.Provider value={value}>{children}</GuideEditorContext.Provider>
}

export { useGuideEditor } from './guide-editor-types'
