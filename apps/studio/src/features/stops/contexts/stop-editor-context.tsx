import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouter, useSearch } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/schema'
import { assignStopAssetFn } from '@valguide/core/features/guides/stop/asset/assign-stop-asset'
import { removeStopAssetFn } from '@valguide/core/features/guides/stop/asset/remove-stop-asset'
import { publishStopLocaleFn } from '@valguide/core/features/guides/stop/locale/publish-stop-locale'
import { unpublishStopLocaleFn } from '@valguide/core/features/guides/stop/locale/unpublish-stop-locale'
import { updateStopLocaleDraftFn } from '@valguide/core/features/guides/stop/locale/update-stop-locale-draft'
import { updateStopFn } from '@valguide/core/features/guides/stop/update-stop'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stopDetailQueryOptions, stopLocaleDraftQueryOptions } from '../query-options'
import { StopEditorContext, type StopEditorContextValue } from './stop-editor-types'

type FormValueGetter = () => { title?: string; description?: string | null; transcription?: string | null }
type FormRegistry = Map<string, { getValues: FormValueGetter; isDirty: boolean }>

const LOCALE_PARAM = 'locale'

function parseLocale(locale: string | undefined, availableLocales: string[]): string {
  if (locale && availableLocales.includes(locale)) {
    return locale
  }
  return availableLocales[0] ?? defaultLocale
}

interface StopEditorProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
}

export function StopEditorProvider({ children, nanoId, initialLocale }: StopEditorProviderProps) {
  const t = useTranslations()
  const router = useRouter()
  const location = useLocation()
  const pathname = location.pathname
  const searchParams = useSearch({ strict: false })
  const queryClient = useQueryClient()

  // Fetch stop detail
  const detailQuery = useQuery(stopDetailQueryOptions(nanoId))
  const stopDetail = detailQuery.data ?? null
  const stopId = stopDetail?.id ?? ''
  const availableLocales = stopDetail?.availableLocales ?? ['en']

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
    ...stopLocaleDraftQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId,
  })
  const localeDraft = localeDraftQuery.data ?? null
  const isLoadingLocale = localeDraftQuery.isLoading

  // Prefetch adjacent locales for instant switching
  useEffect(() => {
    if (!nanoId || availableLocales.length <= 1) return

    const otherLocales = availableLocales.filter((l) => l !== activeLocale)
    for (const locale of otherLocales) {
      queryClient.prefetchQuery(stopLocaleDraftQueryOptions(nanoId, locale))
    }
  }, [nanoId, activeLocale, availableLocales, queryClient])

  // Form dirty tracking and value collection
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formValueGettersRef = useRef<FormRegistry>(new Map())

  // Asset state (in-memory, saved on save())
  const [assets, setAssets] = useState<AssetWithRole[]>([])
  const initialAssetsRef = useRef<AssetWithRole[]>([])

  // Asset dirty tracking
  const isAssetsDirty = useMemo(() => {
    const assetIds = assets.map((a) => a.id).join(',')
    const initialAssetIds = initialAssetsRef.current.map((a) => a.id).join(',')
    return assetIds !== initialAssetIds
  }, [assets])

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Derived isDirty
  const isDirty = dirtyForms.size > 0 || isAssetsDirty

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
        await updateStopFn({ data: { nanoId, availableLocales: locales } })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'detail'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocaleState(locales[0] ?? defaultLocale)
        }

        toast.success(t('stops.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('stops.locales.updateError'))
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

  // Asset operations
  const updateAssets = useCallback((newAssets: AssetWithRole[]) => {
    setAssets(newAssets)
  }, [])

  const addAsset = useCallback(
    (asset: Asset, role: string, locale: string | null) => {
      const assetWithRole: AssetWithRole = { ...asset, role, order: assets.length, locale }
      setAssets((prev) => [...prev, assetWithRole])
    },
    [assets.length],
  )

  const removeAsset = useCallback((assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId))
  }, [])

  // Save orchestration
  const save = useCallback(async () => {
    if (!isDirty || !nanoId) return

    setIsSaving(true)
    try {
      // Save all dirty forms
      for (const [formId, registration] of formValueGettersRef.current.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        if (formId.startsWith('stop-translation-')) {
          await updateStopLocaleDraftFn({
            data: {
              nanoId,
              locale: activeLocale,
              title: values.title ?? '',
              description: values.description ?? '',
              transcription: values.transcription ?? '',
            },
          })
        }
      }

      // Save assets if dirty (using new channel-based API)
      if (isAssetsDirty) {
        // Remove old assets
        for (const asset of initialAssetsRef.current) {
          await removeStopAssetFn({
            data: { nanoId, assetId: asset.id, channel: 'images.gallery', locale: null },
          })
        }
        // Add new assets
        for (const asset of assets) {
          await assignStopAssetFn({
            data: { nanoId, assetId: asset.id, channel: 'images.gallery', locale: null },
          })
        }
        initialAssetsRef.current = assets
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
  }, [isDirty, nanoId, activeLocale, queryClient, resetAllFormsAfterSave, isAssetsDirty, assets, t])

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
    assets,
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
    backPath: '/stops',
    backLabel: t('stops.backToStops'),
  }

  return <StopEditorContext.Provider value={value}>{children}</StopEditorContext.Provider>
}

export { useStopEditor, useStopEditorOptional } from './stop-editor-types'
