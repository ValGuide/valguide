import { useQuery } from '@tanstack/react-query'
import type { Asset } from '@valguide/core/features/assets/schema'
import { assignStopAssetFn } from '@valguide/core/features/guides/stop/asset/assign-stop-asset.fn'
import { removeStopAssetFn } from '@valguide/core/features/guides/stop/asset/remove-stop-asset.fn'
import type { StopDetail } from '@valguide/core/features/guides/stop/get-stop-detail.fn'
import type { StopLocaleDraftResult } from '@valguide/core/features/guides/stop/locale/get-stop-locale-draft.fn'
import type { StopLocalePublishedResult } from '@valguide/core/features/guides/stop/locale/get-stop-locale-published.fn'
import { publishStopLocaleFn } from '@valguide/core/features/guides/stop/locale/publish-stop-locale.fn'
import { unpublishStopLocaleFn } from '@valguide/core/features/guides/stop/locale/unpublish-stop-locale.fn'
import { updateStopLocaleDraftFn } from '@valguide/core/features/guides/stop/locale/update-stop-locale-draft.fn'
import { updateStopFn } from '@valguide/core/features/guides/stop/update-stop.fn'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback } from 'react'
import { useEditorBase } from '@/features/editor/hooks/use-editor-base'
import {
  stopAssetsDraftQueryOptions,
  stopAssetsPublishedQueryOptions,
  stopDetailQueryOptions,
  stopLocaleDraftQueryOptions,
  stopLocalePublishedQueryOptions,
} from '../query-options'
import { StopEditorContext, type StopEditorContextValue } from './stop-editor-types'

interface StopEditorProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
  navigation?: {
    backPath: string
    backLabel: string
    backParams?: Record<string, string>
  }
}

export function StopEditorProvider({ children, nanoId, initialLocale, navigation }: StopEditorProviderProps) {
  const t = useTranslations()

  const base = useEditorBase<StopDetail, StopLocaleDraftResult, StopLocalePublishedResult>({
    nanoId,
    initialLocale,
    detailQueryOptions: stopDetailQueryOptions,
    localeDraftQueryOptions: stopLocaleDraftQueryOptions,
    localePublishedQueryOptions: stopLocalePublishedQueryOptions,
  })

  const {
    entityId: stopId,
    detail: stopDetail,
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

  // Stop assets from server (immediate operations, no local state)
  const assetsQuery = useQuery({
    ...stopAssetsDraftQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const assetsRaw = assetsQuery.data?.assets ?? []
  const isLoadingAssets = assetsQuery.isLoading

  // Transform to AssetWithRole format
  const assets: AssetWithRole[] = assetsRaw.map((item) => ({
    ...item.asset,
    role: item.channel.startsWith('audio.') ? 'audio' : item.channel === 'images.gallery' ? 'gallery' : item.channel,
    order: item.position,
    locale: item.locale,
  }))

  // Published stop assets
  const assetsPublishedQuery = useQuery({
    ...stopAssetsPublishedQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const assetsPublishedRaw = assetsPublishedQuery.data?.assets ?? []
  const isLoadingAssetsPublished = assetsPublishedQuery.isLoading

  // Transform published assets to AssetWithRole format
  const assetsPublished: AssetWithRole[] = assetsPublishedRaw.map((item) => ({
    ...item.asset,
    role: item.channel.startsWith('audio.') ? 'audio' : item.channel === 'images.gallery' ? 'gallery' : item.channel,
    order: item.position,
    locale: item.locale,
  }))

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

        toast.success(t('stops.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('stops.locales.updateError'))
      }
    },
    [nanoId, queryClient, activeLocale, setActiveLocale, t],
  )

  // Asset operations (immediate server calls)
  const updateAssets = useCallback(
    async (newAssets: AssetWithRole[]) => {
      if (!nanoId) return

      try {
        for (const current of assets) {
          if (!newAssets.find((a) => a.id === current.id)) {
            const channel = current.role === 'audio' ? 'audio.narration' : 'images.gallery'
            await removeStopAssetFn({
              data: { nanoId, assetId: current.id, channel, locale: current.locale },
            })
          }
        }

        for (let i = 0; i < newAssets.length; i++) {
          const asset = newAssets[i]
          if (!assets.find((c) => c.id === asset.id)) {
            const channel = asset.role === 'audio' ? 'audio.narration' : 'images.gallery'
            await assignStopAssetFn({
              data: { nanoId, assetId: asset.id, channel, locale: asset.locale, position: i },
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
    async (asset: Asset, role: string, locale: string | null) => {
      if (!nanoId) return

      try {
        const channel = role === 'audio' ? 'audio.narration' : 'images.gallery'
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
        const asset = assets.find((a) => a.id === assetId)
        const channel = asset?.role === 'audio' ? 'audio.narration' : 'images.gallery'
        await removeStopAssetFn({
          data: { nanoId, assetId, channel, locale: asset?.locale ?? null },
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
      toast.success(t('common.saved'))
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
        toast.success(t('stops.publish.success'))
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
        toast.success(t('stops.unpublish.success'))
      } catch (error) {
        console.error('Failed to unpublish:', error)
        toast.error(t('stops.unpublish.error'))
      }
    },
    [nanoId, queryClient, t],
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
    activeLocale,
    availableLocales,
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
    refetch,
    navigation: navigation ?? defaultNavigation,
  }

  return <StopEditorContext.Provider value={value}>{children}</StopEditorContext.Provider>
}

export { useStopEditor, useStopEditorOptional } from './stop-editor-types'
