import { useQuery } from '@tanstack/react-query'
import type { Asset } from '@valguide/core/features/assets/types'
import { assignStopAssetFn } from '@valguide/core/features/tours/stop/asset/assign-stop-asset.fn'
import type { StopAssetDraftItem } from '@valguide/core/features/tours/stop/asset/get-stop-assets-draft.fn'
import { removeStopAssetFn } from '@valguide/core/features/tours/stop/asset/remove-stop-asset.fn'
import { discardAllStopChangesFn } from '@valguide/core/features/tours/stop/discard-all-stop-changes.fn'
import type { StopDetail } from '@valguide/core/features/tours/stop/get-stop-detail.fn'
import type { StopLocaleDraftResult } from '@valguide/core/features/tours/stop/locale/get-stop-locale-draft.fn'
import type { StopLocalePublishedResult } from '@valguide/core/features/tours/stop/locale/get-stop-locale-published.fn'
import { publishStopLocaleFn } from '@valguide/core/features/tours/stop/locale/publish-stop-locale.fn'
import { unpublishStopLocaleFn } from '@valguide/core/features/tours/stop/locale/unpublish-stop-locale.fn'
import { updateStopLocaleDraftFn } from '@valguide/core/features/tours/stop/locale/update-stop-locale-draft.fn'
import { updateStopFn } from '@valguide/core/features/tours/stop/update-stop.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback, useMemo } from 'react'
import { useEditorBase } from '@/features/editor/hooks/use-editor-base'
import {
  stopAssetsDraftQueryOptions,
  stopAssetsPublishedQueryOptions,
  stopDetailQueryOptions,
  stopLocaleDraftQueryOptions,
  stopLocalePublishedQueryOptions,
  stopTourUsageQueryOptions,
} from '../query-options'
import { StopEditorContext, type StopEditorContextValue } from './stop-editor-types'

interface StopEditorProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
  /** When editing a stop within a tour context, pass the tour's available locales.
   * This determines which locales are shown in the locale picker (tour's locales only). */
  tourAvailableLocales?: string[]
  navigation?: {
    backPath: string
    backLabel: string
    backParams?: Record<string, string>
  }
}

export function StopEditorProvider({
  children,
  nanoId,
  initialLocale,
  tourAvailableLocales,
  navigation,
}: StopEditorProviderProps) {
  const t = useTranslations()

  const base = useEditorBase<StopDetail, StopLocaleDraftResult, StopLocalePublishedResult>({
    nanoId,
    initialLocale,
    // When editing in tour context, use tour's locales for initial locale validation
    availableLocalesOverride: tourAvailableLocales,
    detailQueryOptions: stopDetailQueryOptions,
    localeDraftQueryOptions: stopLocaleDraftQueryOptions,
    localePublishedQueryOptions: stopLocalePublishedQueryOptions,
  })

  const {
    entityId: stopId,
    detail: stopDetail,
    activeLocale,
    availableLocales: _baseAvailableLocales,
    existingLocales,
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

  // Whether editing within a tour context (vs standalone stop library)
  const isInTourContext = !!tourAvailableLocales

  // Compute effective available locales based on context:
  // - Tour context: show only tour's locales (the "project languages")
  // - Standalone: show only stop's existing locales
  // Note: When switching to a locale not yet in stop, the route loader's
  // getOrCreateStopLocaleDraftForTourFn creates records on-demand (like tours).
  const availableLocales = useMemo(() => {
    if (tourAvailableLocales) {
      return tourAvailableLocales
    }
    return existingLocales
  }, [tourAvailableLocales, existingLocales])

  // Stop assets from server (immediate operations, no local state)
  const assetsQuery = useQuery({
    ...stopAssetsDraftQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const assets = assetsQuery.data?.assets ?? []
  const isLoadingAssets = assetsQuery.isLoading

  // Published stop assets
  const assetsPublishedQuery = useQuery({
    ...stopAssetsPublishedQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const assetsPublished = assetsPublishedQuery.data?.assets ?? []
  const isLoadingAssetsPublished = assetsPublishedQuery.isLoading

  // Tour usage (for shared stop indicator)
  const tourUsageQuery = useQuery({
    ...stopTourUsageQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const tourUsage = tourUsageQuery.data ?? null
  const isLoadingTourUsage = tourUsageQuery.isLoading

  // Update available locales
  const updateAvailableLocales = useCallback(
    async (locales: string[]) => {
      if (!nanoId) return
      try {
        await updateStopFn({ data: { nanoId, availableLocales: locales } })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'detail'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocale(locales[0] ?? defaultLocale)
        }
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('stops.locales.updateError'))
      }
    },
    [nanoId, queryClient, activeLocale, setActiveLocale, t],
  )

  // Asset operations (immediate server calls)
  const updateAssets = useCallback(
    async (newAssets: StopAssetDraftItem[]) => {
      if (!nanoId) return

      try {
        for (const current of assets) {
          if (!newAssets.find((a) => a.asset.id === current.asset.id)) {
            await removeStopAssetFn({
              data: { nanoId, assetId: current.asset.id, channel: current.channel, locale: current.locale },
            })
          }
        }

        for (let i = 0; i < newAssets.length; i++) {
          const item = newAssets[i]
          if (!assets.find((c) => c.asset.id === item.asset.id)) {
            await assignStopAssetFn({
              data: { nanoId, assetId: item.asset.id, channel: item.channel, locale: item.locale, position: i },
            })
          }
        }

        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'assets'] })
      } catch (error) {
        console.error('Failed to update stop assets:', error)
        toast.error(t('stops.assets.updateError'))
      }
    },
    [nanoId, assets, queryClient, t],
  )

  const addAsset = useCallback(
    async (asset: Asset, channel: string, locale: string | null) => {
      if (!nanoId) return

      try {
        await assignStopAssetFn({
          data: { nanoId, assetId: asset.id, channel, locale, position: assets.length },
        })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'assets'] })
      } catch (error) {
        console.error('Failed to add stop asset:', error)
        toast.error(t('stops.assets.addError'))
      }
    },
    [nanoId, assets.length, queryClient, t],
  )

  const removeAsset = useCallback(
    async (assetId: string) => {
      if (!nanoId) return

      try {
        const item = assets.find((a) => a.asset.id === assetId)
        await removeStopAssetFn({
          data: { nanoId, assetId, channel: item?.channel ?? 'images.gallery', locale: item?.locale ?? null },
        })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'assets'] })
      } catch (error) {
        console.error('Failed to remove stop asset:', error)
        toast.error(t('stops.assets.removeError'))
      }
    },
    [nanoId, assets, queryClient, t],
  )

  // Save orchestration
  const save = useCallback(async () => {
    if (!isDirty || !nanoId) return

    setIsSaving(true)
    try {
      const formValues = getFormValues()
      for (const [formId, registration] of formValues.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        if (formId.startsWith('stop-translation-')) {
          await updateStopLocaleDraftFn({
            data: {
              nanoId,
              locale: activeLocale,
              title: (values.title as string) ?? '',
              description: (values.description as string) ?? '',
              transcription: (values.transcription as string) ?? '',
            },
          })
        }
      }

      resetAllFormsAfterSave()

      await queryClient.invalidateQueries({ queryKey: ['stop', nanoId] })
      await queryClient.invalidateQueries({ queryKey: ['stops'] })

      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, nanoId, activeLocale, queryClient, resetAllFormsAfterSave, getFormValues, setIsSaving, setLastSaved, t])

  // Publish locale
  const publish = useCallback(
    async (locale: string) => {
      await save()
      if (!nanoId) return

      try {
        await publishStopLocaleFn({ data: { nanoId, locale } })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId] })
      } catch (error) {
        console.error('Failed to publish:', error)
        toast.error(t('stops.publish.error'))
      }
    },
    [nanoId, queryClient, save, t],
  )

  // Unpublish locale
  const unpublish = useCallback(
    async (locale: string) => {
      if (!nanoId) return

      try {
        await unpublishStopLocaleFn({ data: { nanoId, locale } })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId] })
      } catch (error) {
        console.error('Failed to unpublish:', error)
        toast.error(t('stops.unpublish.error'))
      }
    },
    [nanoId, queryClient, t],
  )

  // Discard all changes (revert drafts to published state)
  const discard = useCallback(
    async (locale: string) => {
      if (!nanoId) return

      await discardAllStopChangesFn({ data: { nanoId, locale } })
      await queryClient.invalidateQueries({ queryKey: ['stop', nanoId] })
      resetAllForms()
    },
    [nanoId, queryClient, resetAllForms],
  )

  // Refetch
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['stop', nanoId] })
    resetAllForms()
  }, [nanoId, queryClient, resetAllForms])

  const defaultNavigation = {
    backPath: '/stops',
    backLabel: t('stops.backToStops'),
  }

  const value: StopEditorContextValue = {
    nanoId,
    stopId,
    isInTourContext,
    activeLocale,
    availableLocales,
    existingLocales,
    setActiveLocale,
    updateAvailableLocales,
    stopDetail,
    localeDraft,
    isLoadingLocale,
    localePublished,
    isLoadingLocalePublished,
    assets,
    isLoadingAssets,
    assetsPublished,
    isLoadingAssetsPublished,
    updateAssets,
    addAsset,
    removeAsset,
    tourUsage,
    isLoadingTourUsage,
    isDirty,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    resetAllForms,
    save,
    isSaving,
    lastSaved,
    publish,
    unpublish,
    discard,
    refetch,
    navigation: navigation ?? defaultNavigation,
  }

  return <StopEditorContext.Provider value={value}>{children}</StopEditorContext.Provider>
}

export { useStopEditor, useStopEditorOptional } from './stop-editor-types'
