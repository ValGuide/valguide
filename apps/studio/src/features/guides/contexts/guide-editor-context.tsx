import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useLocation, useRouter, useSearch } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/schema'
import { assignGuideAssetFn } from '@valguide/core/features/guides/guide/asset/assign-guide-asset.fn'
import { removeGuideAssetFn } from '@valguide/core/features/guides/guide/asset/remove-guide-asset.fn'
import { publishGuideLocaleFn } from '@valguide/core/features/guides/guide/locale/publish-guide-locale.fn'
import { updateGuideLocaleDraftFn } from '@valguide/core/features/guides/guide/locale/update-guide-locale-draft.fn'
import { updateGuideFn } from '@valguide/core/features/guides/guide/update-guide.fn'
import { createStopFn } from '@valguide/core/features/guides/stop/create-stop.fn'
import { addStopToGuideFn } from '@valguide/core/features/guides/structure/add-stop.fn'
import { removeStopFromGuideFn } from '@valguide/core/features/guides/structure/remove-stop.fn'
import { reorderStopsFn } from '@valguide/core/features/guides/structure/reorder-stops.fn'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  guideAssetsDraftQueryOptions,
  guideDetailQueryOptions,
  guideLocaleDraftQueryOptions,
  guideLocalePublishedQueryOptions,
  guideStructureDraftQueryOptions,
} from '../query-options'
import { type FormValueGetter, GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

type FormRegistry = Map<string, { getValues: FormValueGetter; isDirty: boolean }>

const LOCALE_PARAM = 'locale'

function parseLocale(locale: string | undefined, availableLocales: string[]): string {
  if (locale && availableLocales.includes(locale)) {
    return locale
  }
  return availableLocales[0] ?? defaultLocale
}

interface GuideEditorProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
}

export function GuideEditorProvider({ children, nanoId, initialLocale }: GuideEditorProviderProps) {
  const t = useTranslations()
  const router = useRouter()
  const location = useLocation()
  const pathname = location.pathname
  const searchParams = useSearch({ strict: false })
  const queryClient = useQueryClient()

  // Fetch guide detail (uses Suspense - data guaranteed by route loader)
  const detailQuery = useSuspenseQuery(guideDetailQueryOptions(nanoId))
  const guideDetail = detailQuery.data
  const guideId = guideDetail.id
  const availableLocales = guideDetail.availableLocales

  // Active locale state
  const [activeLocale, setActiveLocaleState] = useState<string>(() => parseLocale(initialLocale, availableLocales))

  // Sync active locale when detail updates and initialLocale becomes valid
  useEffect(() => {
    if (initialLocale && availableLocales.includes(initialLocale) && activeLocale !== initialLocale) {
      setActiveLocaleState(initialLocale)
    }
  }, [initialLocale, availableLocales, activeLocale])

  // Fetch locale-specific draft
  const localeDraftQuery = useQuery({
    ...guideLocaleDraftQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId,
  })
  const localeDraft = localeDraftQuery.data ?? null
  const isLoadingLocale = localeDraftQuery.isLoading

  // Fetch locale-specific published version
  const localePublishedQuery = useQuery({
    ...guideLocalePublishedQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId,
  })
  const localePublished = localePublishedQuery.data ?? null
  const isLoadingLocalePublished = localePublishedQuery.isLoading

  // Fetch stops from structure
  const structureQuery = useQuery({
    ...guideStructureDraftQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId,
  })
  const stops = structureQuery.data?.stops ?? []

  // Prefetch adjacent locales for instant switching
  useEffect(() => {
    if (!nanoId || availableLocales.length <= 1) return

    const otherLocales = availableLocales.filter((l) => l !== activeLocale)
    for (const locale of otherLocales) {
      queryClient.prefetchQuery(guideLocaleDraftQueryOptions(nanoId, locale))
      queryClient.prefetchQuery(guideLocalePublishedQueryOptions(nanoId, locale))
    }
  }, [nanoId, activeLocale, availableLocales, queryClient])

  // Form dirty tracking and value collection
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formValueGettersRef = useRef<FormRegistry>(new Map())

  // Guide assets from server (immediate operations, no local state)
  const guideAssetsQuery = useQuery({
    ...guideAssetsDraftQueryOptions(nanoId),
    enabled: !!nanoId,
  })
  const guideAssetsRaw = guideAssetsQuery.data?.assets ?? []
  const isLoadingGuideAssets = guideAssetsQuery.isLoading

  // Transform to AssetWithRole format
  const guideAssets: AssetWithRole[] = guideAssetsRaw.map((item) => ({
    ...item.asset,
    role: item.channel === 'images.hero' ? 'cover' : item.channel,
    order: item.position,
    locale: item.locale,
  }))

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Derived isDirty (no longer includes assets - they're saved immediately)
  const isDirty = dirtyForms.size > 0

  // Set active locale and update URL
  const setActiveLocale = useCallback(
    (locale: string) => {
      if (!availableLocales.includes(locale)) {
        console.warn(`Locale ${locale} not in available locales`)
        return
      }
      setActiveLocaleState(locale)
      router.navigate({ to: pathname, search: { ...searchParams, [LOCALE_PARAM]: locale }, replace: true })
    },
    [pathname, router, searchParams, availableLocales],
  )

  // Update available locales
  const updateAvailableLocales = useCallback(
    async (locales: string[]) => {
      if (!nanoId) return
      try {
        await updateGuideFn({ data: { nanoId, availableLocales: locales } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'detail'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocaleState(locales[0] ?? defaultLocale)
        }

        toast.success(t('guides.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('guides.locales.updateError'))
      }
    },
    [nanoId, queryClient, activeLocale, t],
  )

  // Form registration
  const registerFormDirty = useCallback((formId: string, formIsDirty: boolean, getValues?: FormValueGetter) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      if (formIsDirty) next.add(formId)
      else next.delete(formId)
      return next
    })
    if (getValues) {
      formValueGettersRef.current.set(formId, { getValues, isDirty: formIsDirty })
    }
  }, [])

  const unregisterForm = useCallback((formId: string) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      next.delete(formId)
      return next
    })
    formResetFnsRef.current.delete(formId)
    formValueGettersRef.current.delete(formId)
  }, [])

  const registerFormReset = useCallback((formId: string, resetFn: () => void) => {
    formResetFnsRef.current.set(formId, resetFn)
  }, [])

  const resetAllForms = useCallback(() => {
    for (const resetFn of formResetFnsRef.current.values()) {
      resetFn()
    }
    setDirtyForms(new Set())
  }, [])

  const resetAllFormsAfterSave = useCallback(() => {
    setDirtyForms(new Set())
    for (const [formId, registration] of formValueGettersRef.current.entries()) {
      formValueGettersRef.current.set(formId, { ...registration, isDirty: false })
    }
  }, [])

  // Stop operations
  const addStop = useCallback(async () => {
    if (!nanoId) return null
    try {
      const newStop = await createStopFn({ data: { title: t('stops.newStopTitle'), locale: activeLocale } })

      // Add to guide structure
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
        // Remove existing cover assets
        const existingCovers = guideAssets.filter((a) => a.role === 'cover')
        for (const cover of existingCovers) {
          await removeGuideAssetFn({
            data: { nanoId, assetId: cover.id, channel: 'images.hero', locale: null },
          })
        }

        // Add new cover if provided
        if (asset) {
          await assignGuideAssetFn({
            data: { nanoId, assetId: asset.id, channel: 'images.hero', locale: null, position: 0 },
          })
        }

        // Invalidate assets query to refetch
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
      // Save all dirty guide translation forms
      for (const [formId, registration] of formValueGettersRef.current.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        if (formId.startsWith('guide-translation-')) {
          await updateGuideLocaleDraftFn({
            data: {
              nanoId,
              locale: activeLocale,
              title: values.title ?? '',
              description: values.description ?? '',
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
  }, [isDirty, nanoId, activeLocale, queryClient, resetAllFormsAfterSave, t])

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

  const value: GuideEditorContextValue = {
    nanoId,
    guideId,
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
