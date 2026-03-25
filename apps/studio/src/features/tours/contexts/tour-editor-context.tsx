import { useQuery } from '@tanstack/react-query'
import type { Asset } from '@valguide/core/features/assets/types'
import { assignTourAssetFn } from '@valguide/core/features/tours/tour/asset/assign-tour-asset.fn'
import { removeTourAssetFn } from '@valguide/core/features/tours/tour/asset/remove-tour-asset.fn'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import type { TourLocaleDraftResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-draft.fn'
import type { TourLocalePublishedResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-published.fn'
import { updateTourLocaleDraftFn } from '@valguide/core/features/tours/tour/locale/update-tour-locale-draft.fn'
import { publishTourFn } from '@valguide/core/features/tours/tour/publish-tour.fn'
import { updateTourFn } from '@valguide/core/features/tours/tour/update-tour.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback } from 'react'
import { useEditorBase } from '@/features/editor/hooks/use-editor-base'
import { useEnableAfterMount } from '@/features/editor/hooks/use-enable-after-mount'
import {
  tourAssetsDraftQueryOptions,
  tourAssetsPublishedQueryOptions,
  tourDetailQueryOptions,
  tourLocaleDraftQueryOptions,
  tourLocalePublishedQueryOptions,
} from '../query-options'
import { TourEditorStopsProvider } from './tour-editor-stops-context'
import { TourEditorContext, type TourEditorContextValue } from './tour-editor-types'

interface TourEditorProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
  navigation?: {
    backPath: string
    backLabel: string
  }
}

export function TourEditorProvider({ children, nanoId, initialLocale, navigation }: TourEditorProviderProps) {
  const t = useTranslations()
  const secondaryQueriesEnabled = useEnableAfterMount()

  const base = useEditorBase<TourDetail, TourLocaleDraftResult, TourLocalePublishedResult>({
    nanoId,
    initialLocale,
    detailQueryOptions: tourDetailQueryOptions,
    localeDraftQueryOptions: tourLocaleDraftQueryOptions,
    localePublishedQueryOptions: tourLocalePublishedQueryOptions,
    enablePublishedQuery: secondaryQueriesEnabled,
    prefetchOtherLocales: secondaryQueriesEnabled,
  })

  const {
    entityId: tourId,
    detail: tourDetail,
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

  // Tour assets from server (immediate operations, no local state)
  const tourAssetsQuery = useQuery({
    ...tourAssetsDraftQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const tourAssets = tourAssetsQuery.data?.assets ?? []
  const isLoadingTourAssets = tourAssetsQuery.isLoading

  // Published tour assets
  const tourAssetsPublishedQuery = useQuery({
    ...tourAssetsPublishedQueryOptions(nanoId),
    enabled: !!nanoId && secondaryQueriesEnabled,
  })
  const tourAssetsPublished = tourAssetsPublishedQuery.data?.assets ?? []
  const isLoadingTourAssetsPublished = tourAssetsPublishedQuery.isLoading

  // Update available locales
  const updateAvailableLocales = useCallback(
    async (locales: string[]) => {
      if (!nanoId) return
      try {
        await updateTourFn({ data: { nanoId, availableLocales: locales } })
        await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'detail'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocale(locales[0] ?? defaultLocale)
        }
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('tours.locales.updateError'))
      }
    },
    [nanoId, queryClient, activeLocale, setActiveLocale, t],
  )

  // Tour asset operations (immediate server calls)
  const setTourCover = useCallback(
    async (asset: Asset | null) => {
      if (!nanoId) return

      try {
        const existingCovers = tourAssets.filter((a) => a.channel === 'images.hero')
        for (const cover of existingCovers) {
          await removeTourAssetFn({
            data: { nanoId, assetId: cover.asset.id, channel: 'images.hero', locale: null },
          })
        }

        if (asset) {
          await assignTourAssetFn({
            data: { nanoId, assetId: asset.id, channel: 'images.hero', locale: null, position: 0 },
          })
        }

        await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'assets'] })
      } catch (error) {
        console.error('Failed to set tour cover:', error)
        toast.error(t('tours.assets.updateError'))
      }
    },
    [nanoId, tourAssets, queryClient, t],
  )

  // Save orchestration - only handles tour translation forms
  const save = useCallback(async () => {
    if (!isDirty || !nanoId) return

    setIsSaving(true)
    try {
      const formValues = getFormValues()
      for (const [formId, registration] of formValues.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        if (formId.startsWith('tour-translation-')) {
          await updateTourLocaleDraftFn({
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

      await queryClient.invalidateQueries({ queryKey: ['tour', nanoId] })
      await queryClient.invalidateQueries({ queryKey: ['tours'] })

      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, nanoId, activeLocale, queryClient, resetAllFormsAfterSave, getFormValues, setIsSaving, setLastSaved, t])

  // Publish tour (locale, structure, settings, assets, and all stop translations)
  const publish = useCallback(async () => {
    await save()
    if (!nanoId) return

    try {
      await publishTourFn({ data: { nanoId, locale: activeLocale } })
      await queryClient.invalidateQueries({ queryKey: ['tour', nanoId] })
      await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'structure'] })
      await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'assets'] })
      await queryClient.invalidateQueries({ queryKey: ['stops'] })
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('tours.publish.tourPublishError'))
    }
  }, [nanoId, activeLocale, queryClient, save, t])

  // Refetch
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['tour', nanoId] })
    resetAllForms()
  }, [nanoId, queryClient, resetAllForms])

  const defaultNavigation = { backPath: `/tours/${nanoId}`, backLabel: 'tours.editor.tourDetails' }

  const value: TourEditorContextValue = {
    nanoId,
    tourId,
    navigation: navigation ?? defaultNavigation,
    activeLocale,
    availableLocales,
    setActiveLocale,
    updateAvailableLocales,
    tourDetail,
    localeDraft,
    isLoadingLocale,
    localePublished,
    isLoadingLocalePublished,
    tourAssets,
    isLoadingTourAssets,
    tourAssetsPublished,
    isLoadingTourAssetsPublished,
    setTourCover,
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

  return (
    <TourEditorContext.Provider value={value}>
      <TourEditorStopsProvider>{children}</TourEditorStopsProvider>
    </TourEditorContext.Provider>
  )
}

export { useTourEditor } from './tour-editor-types'
