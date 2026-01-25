import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouter, useSearch } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/schema'
import {
  discardStopTranslationDraftFn,
  publishStopAssetsFn,
  publishStopTranslationDraftFn,
  saveStopAssetsDraftFn,
  unpublishStopTranslationFn,
  updateStopAvailableLocalesFn,
  updateStopByNanoIdFn,
} from '@valguide/core/features/guides/stop/server-functions'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stopLocaleDataQueryOptions, stopMetadataQueryOptions } from '../query-options'
import { StopEditorContext, type StopEditorContextValue } from './stop-editor-types'

// Type for form value getters
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

  // Fetch metadata (no translations)
  const metadataQuery = useQuery(stopMetadataQueryOptions(nanoId))
  const metadata = metadataQuery.data ?? null
  const stopId = metadata?.id ?? ''
  const availableLocales = metadata?.availableLocales ?? ['en']

  // Active locale state
  const [activeLocale, setActiveLocaleState] = useState<string>(() => parseLocale(initialLocale, availableLocales))

  // Sync active locale when metadata updates and initialLocale becomes valid
  useEffect(() => {
    if (initialLocale && availableLocales.includes(initialLocale) && activeLocale !== initialLocale) {
      setActiveLocaleState(initialLocale)
    }
  }, [initialLocale, availableLocales, activeLocale])

  // Fetch locale-specific translations
  const localeQuery = useQuery({
    ...stopLocaleDataQueryOptions(stopId, activeLocale),
    enabled: !!stopId,
  })
  const localeData = localeQuery.data ?? null
  const isLoadingLocale = localeQuery.isLoading

  // Prefetch adjacent locales for instant switching
  useEffect(() => {
    if (!stopId || availableLocales.length <= 1) return

    const otherLocales = availableLocales.filter((l) => l !== activeLocale)
    for (const locale of otherLocales) {
      queryClient.prefetchQuery(stopLocaleDataQueryOptions(stopId, locale))
    }
  }, [stopId, activeLocale, availableLocales, queryClient])

  // Form dirty tracking and value collection
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formSaveResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formValueGettersRef = useRef<FormRegistry>(new Map())

  // Asset state (in-memory, saved on save())
  const [assets, setAssets] = useState<AssetWithRole[]>([])
  const initialAssetsRef = useRef<AssetWithRole[]>([])

  // Initialize asset state from metadata
  useEffect(() => {
    if (metadata) {
      setAssets(metadata.assets)
      initialAssetsRef.current = metadata.assets
    }
  }, [metadata])

  // Asset dirty tracking
  const isAssetsDirty = useMemo(() => {
    const assetIds = assets.map((a) => a.id).join(',')
    const initialAssetIds = initialAssetsRef.current.map((a) => a.id).join(',')
    return assetIds !== initialAssetIds
  }, [assets])

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Derived isDirty (forms OR assets)
  const isDirty = dirtyForms.size > 0 || isAssetsDirty

  // Set active locale and update URL (always include locale param)
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
      if (!stopId) return
      try {
        await updateStopAvailableLocalesFn({
          data: {
            stopId,
            availableLocales: locales,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'metadata'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocaleState(locales[0] ?? defaultLocale)
        }

        toast.success(t('stops.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('stops.locales.updateError'))
      }
    },
    [stopId, nanoId, queryClient, activeLocale, t],
  )

  // Form registration
  const registerFormDirty = useCallback((formId: string, formIsDirty: boolean, getValues?: FormValueGetter) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      if (formIsDirty) {
        next.add(formId)
      } else {
        next.delete(formId)
      }
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
    formSaveResetFnsRef.current.delete(formId)
    formValueGettersRef.current.delete(formId)
  }, [])

  const registerFormReset = useCallback((formId: string, resetFn: () => void, saveResetFn?: () => void) => {
    formResetFnsRef.current.set(formId, resetFn)
    if (saveResetFn) {
      formSaveResetFnsRef.current.set(formId, saveResetFn)
    }
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
      const assetWithRole: AssetWithRole = {
        ...asset,
        role,
        order: assets.length,
        locale,
      }
      setAssets((prev) => [...prev, assetWithRole])
    },
    [assets.length],
  )

  const removeAsset = useCallback((assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId))
  }, [])

  // Save orchestration
  const save = useCallback(async () => {
    if (!isDirty || !stopId) return

    setIsSaving(true)
    try {
      // Collect values from all dirty forms and save them
      for (const [formId, registration] of formValueGettersRef.current.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        // Save stop translation
        if (formId.startsWith('stop-translation-')) {
          await updateStopByNanoIdFn({
            data: {
              stopNanoId: nanoId,
              locale: activeLocale,
              title: values.title ?? '',
              description: values.description ?? '',
              transcription: values.transcription ?? '',
            },
          })
        }
      }

      // Save assets if dirty
      if (isAssetsDirty) {
        await saveStopAssetsDraftFn({
          data: {
            stopId,
            assets: assets.map((a, index) => ({
              assetId: a.id,
              order: index,
              role: a.role,
              locale: a.locale ?? null,
            })),
          },
        })
        initialAssetsRef.current = assets
      }

      // Reset all forms after successful save
      resetAllFormsAfterSave()

      // Invalidate queries to get fresh data
      await queryClient.invalidateQueries({ queryKey: ['stop', stopId, 'locale', activeLocale] })
      await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'metadata'] })
      await queryClient.invalidateQueries({ queryKey: ['stops'] })

      setLastSaved(new Date())
      toast.success(t('common.saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, stopId, nanoId, activeLocale, queryClient, resetAllFormsAfterSave, isAssetsDirty, assets, t])

  // Publish translation for a specific locale
  const publish = useCallback(
    async (locale: string) => {
      if (!stopId) return

      try {
        // Save first to ensure draft exists
        await save()

        // Publish translation
        await publishStopTranslationDraftFn({ data: { stopId, locale } })

        // Publish assets
        await publishStopAssetsFn({ data: { stopId } })

        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'metadata'] })
        await queryClient.invalidateQueries({ queryKey: ['stop', stopId, 'locale', locale] })
        await queryClient.invalidateQueries({ queryKey: ['stops'] })

        toast.success(t('stops.publish.success'))
      } catch (error) {
        console.error('Failed to publish:', error)
        toast.error(t('stops.publish.error'))
      }
    },
    [stopId, nanoId, queryClient, save, t],
  )

  // Unpublish translation for a specific locale
  const unpublish = useCallback(
    async (locale: string) => {
      if (!stopId) return

      try {
        await unpublishStopTranslationFn({ data: { stopId, locale } })

        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'metadata'] })
        await queryClient.invalidateQueries({ queryKey: ['stop', stopId, 'locale', locale] })
        await queryClient.invalidateQueries({ queryKey: ['stops'] })

        toast.success(t('stops.unpublish.success'))
      } catch (error) {
        console.error('Failed to unpublish:', error)
        toast.error(t('stops.unpublish.error'))
      }
    },
    [stopId, nanoId, queryClient, t],
  )

  // Discard draft for a specific locale
  const discard = useCallback(
    async (locale: string) => {
      if (!stopId) return

      try {
        await discardStopTranslationDraftFn({ data: { stopId, locale } })

        await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'metadata'] })
        await queryClient.invalidateQueries({ queryKey: ['stop', stopId, 'locale', locale] })

        resetAllForms()
        toast.success(t('stops.discard.success'))
      } catch (error) {
        console.error('Failed to discard draft:', error)
        toast.error(t('stops.discard.error'))
      }
    },
    [stopId, nanoId, queryClient, resetAllForms, t],
  )

  // Refetch
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['stop', nanoId, 'metadata'] })
    if (stopId) {
      await queryClient.invalidateQueries({ queryKey: ['stop', stopId, 'locale'] })
    }
    resetAllForms()
  }, [stopId, nanoId, queryClient, resetAllForms])

  const value: StopEditorContextValue = {
    nanoId,
    stopId,
    activeLocale,
    availableLocales,
    setActiveLocale,
    updateAvailableLocales,
    metadata,
    localeData,
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
    discard,
    refetch,
    backPath: '/stops',
    backLabel: t('stops.backToStops'),
  }

  return <StopEditorContext.Provider value={value}>{children}</StopEditorContext.Provider>
}

export { useStopEditor, useStopEditorOptional } from './stop-editor-types'
