import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouter, useSearch } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/schema'
import {
  attachAssetToGuideFn,
  attachAssetToStopFn,
  createStopFn,
  deleteStopFn,
  detachAssetFromGuideFn,
  detachAssetFromStopFn,
  reorderStopsFn,
  updateGuideFn,
  updateGuideTranslationFn,
  updateStopFn,
} from '@valguide/core/features/guides/server-functions'
import type { StopMetadata } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { guideLocaleQueryOptions, guideMetadataQueryOptions } from '../query-options'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

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

  // Fetch metadata (no translations)
  const metadataQuery = useQuery(guideMetadataQueryOptions(nanoId))
  const metadata = metadataQuery.data ?? null
  const guideId = metadata?.id ?? ''
  const availableLocales = metadata?.availableLocales ?? ['en', 'de', 'rm']

  // Active locale state
  const [activeLocale, setActiveLocaleState] = useState<string>(() => parseLocale(initialLocale, availableLocales))

  // Fetch locale-specific translations
  const localeQuery = useQuery({
    ...guideLocaleQueryOptions(guideId, activeLocale),
    enabled: !!guideId,
  })
  const localeData = localeQuery.data ?? null
  const isLoadingLocale = localeQuery.isLoading

  // Prefetch adjacent locales for instant switching
  useEffect(() => {
    if (!guideId || availableLocales.length <= 1) return

    // Prefetch all other locales in background
    const otherLocales = availableLocales.filter((l) => l !== activeLocale)
    for (const locale of otherLocales) {
      queryClient.prefetchQuery(guideLocaleQueryOptions(guideId, locale))
    }
  }, [guideId, activeLocale, availableLocales, queryClient])

  // Form dirty tracking and value collection
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formSaveResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formValueGettersRef = useRef<FormRegistry>(new Map())

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Derived isDirty
  const isDirty = dirtyForms.size > 0

  // Set active locale and update URL
  const setActiveLocale = useCallback(
    (locale: string) => {
      if (!availableLocales.includes(locale)) {
        console.warn(`Locale ${locale} not in available locales`)
        return
      }
      setActiveLocaleState(locale)
      const newSearch =
        locale === defaultLocale
          ? { ...searchParams, [LOCALE_PARAM]: undefined }
          : { ...searchParams, [LOCALE_PARAM]: locale }
      router.navigate({ to: pathname, search: newSearch, replace: true })
    },
    [pathname, router, searchParams, availableLocales],
  )

  // Update available locales
  const updateAvailableLocales = useCallback(
    async (locales: string[]) => {
      if (!guideId) return
      try {
        await updateGuideFn({
          data: {
            id: guideId,
            availableLocales: locales,
            organizationId: metadata?.organizationId,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })

        if (!locales.includes(activeLocale)) {
          setActiveLocaleState(locales[0] ?? defaultLocale)
        }

        toast.success(t('guides.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('guides.locales.updateError'))
      }
    },
    [guideId, metadata?.organizationId, nanoId, queryClient, activeLocale],
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
    // Update the value getter in the registry
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
    for (const resetFn of formSaveResetFnsRef.current.values()) {
      resetFn()
    }
    setDirtyForms(new Set())
  }, [])

  // Stop operations
  const stops = useMemo(() => metadata?.stops ?? [], [metadata?.stops])

  const addStop = useCallback(async (): Promise<StopMetadata | null> => {
    if (!guideId || !metadata) return null
    try {
      const newStopWithTranslations = await createStopFn({
        data: {
          guideId,
          position: stops.length,
          translations: [
            {
              locale: 'en',
              title: 'New Stop',
              description: '',
              transcription: '',
            },
          ],
        },
      })

      // Invalidate metadata to get new stop
      await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
      await queryClient.invalidateQueries({ queryKey: ['guide', guideId, 'locale'] })

      toast.success(t('stops.actions.addSuccess'))

      return {
        id: newStopWithTranslations.id,
        nanoId: newStopWithTranslations.nanoId,
        position: stops.length,
        assets: [],
        translationStatuses: [],
      }
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error(t('stops.actions.addError'))
      return null
    }
  }, [guideId, metadata, stops.length, queryClient, nanoId])

  const deleteStop = useCallback(
    async (stopId: string) => {
      try {
        await deleteStopFn({ data: { stopId } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
        await queryClient.invalidateQueries({ queryKey: ['guide', guideId, 'locale'] })
        toast.success(t('stops.actions.deleteSuccess'))
      } catch (error) {
        console.error('Failed to delete stop:', error)
        toast.error(t('stops.actions.deleteError'))
      }
    },
    [guideId, nanoId, queryClient],
  )

  const reorderStops = useCallback(
    async (updates: Array<{ id: string; order: number }>) => {
      try {
        await reorderStopsFn({ data: updates })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
        toast.success(t('stops.actions.reorderSuccess'))
      } catch (error) {
        console.error('Failed to reorder stops:', error)
        toast.error(t('stops.actions.reorderError'))
      }
    },
    [nanoId, queryClient],
  )

  // Asset operations (immediate save)
  const attachAssetToGuide = useCallback(
    async (asset: Asset, role: string) => {
      if (!guideId) return
      try {
        await attachAssetToGuideFn({
          data: {
            guideId,
            assetId: asset.id,
            role,
            locale: undefined,
            order: 0,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
        await queryClient.invalidateQueries({ queryKey: ['guides'] })
        toast.success(t('guides.assets.attachSuccess'))
      } catch (error) {
        console.error('Failed to attach asset to guide:', error)
        toast.error(t('guides.assets.attachError'))
      }
    },
    [guideId, nanoId, queryClient],
  )

  const detachAssetFromGuide = useCallback(
    async (guideAssetId: string) => {
      try {
        await detachAssetFromGuideFn({ data: { guideAssetId } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
        await queryClient.invalidateQueries({ queryKey: ['guides'] })
        toast.success(t('guides.assets.removeSuccess'))
      } catch (error) {
        console.error('Failed to detach asset from guide:', error)
        toast.error(t('guides.assets.removeError'))
      }
    },
    [nanoId, queryClient],
  )

  const attachAssetToStop = useCallback(
    async (stopId: string, asset: Asset, role: string, locale?: string | null) => {
      try {
        await attachAssetToStopFn({
          data: {
            stopId,
            assetId: asset.id,
            role,
            locale: locale ?? undefined,
            order: 0,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
        toast.success(t('stops.assets.attachSuccess'))
      } catch (error) {
        console.error('Failed to attach asset to stop:', error)
        toast.error(t('stops.assets.attachError'))
      }
    },
    [nanoId, queryClient],
  )

  const detachAssetFromStop = useCallback(
    async (stopAssetId: string) => {
      try {
        await detachAssetFromStopFn({ data: { stopAssetId } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
        toast.success(t('stops.assets.removeSuccess'))
      } catch (error) {
        console.error('Failed to detach asset from stop:', error)
        toast.error(t('stops.assets.removeError'))
      }
    },
    [nanoId, queryClient],
  )

  // Save orchestration - collects form values and saves to server
  const save = useCallback(async () => {
    if (!isDirty || !guideId) return

    setIsSaving(true)
    try {
      // Collect values from all dirty forms and save them
      for (const [formId, registration] of formValueGettersRef.current.entries()) {
        if (!registration.isDirty) continue

        const values = registration.getValues()

        // Determine if this is a guide translation or stop translation based on formId
        // Format: guide-translation-{locale} or stop-translation-{stopId}-{locale}
        if (formId.startsWith('guide-translation-')) {
          // Save guide translation
          await updateGuideTranslationFn({
            data: {
              guideId,
              locale: activeLocale,
              title: values.title ?? '',
              description: values.description ?? '',
            },
          })
        } else if (formId.startsWith('stop-translation-')) {
          // Extract stopId from formId: stop-translation-{stopId}-{locale}
          const parts = formId.split('-')
          const stopId = parts[2] // stop-translation-{stopId}-{locale}
          if (stopId) {
            await updateStopFn({
              data: {
                stopId,
                locale: activeLocale,
                title: values.title ?? '',
                description: values.description ?? '',
                transcription: values.transcription ?? '',
              },
            })
          }
        }
      }

      // Reset all forms after successful save
      resetAllFormsAfterSave()

      // Invalidate locale query to get fresh data with new version IDs
      await queryClient.invalidateQueries({ queryKey: ['guide', guideId, 'locale', activeLocale] })

      setLastSaved(new Date())
      toast.success(t('common.saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, guideId, activeLocale, queryClient, resetAllFormsAfterSave])

  // Publish
  const publish = useCallback(async () => {
    await save()

    if (!guideId || !metadata) return

    try {
      await updateGuideFn({
        data: {
          id: guideId,
          published: new Date(),
          organizationId: metadata.organizationId,
        },
      })

      await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
      toast.success(t('guides.publish.guidePublished'))
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('guides.publish.guidePublishError'))
    }
  }, [guideId, metadata, nanoId, queryClient, save])

  // Refetch
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['guide', nanoId, 'metadata'] })
    if (guideId) {
      await queryClient.invalidateQueries({ queryKey: ['guide', guideId, 'locale'] })
    }
    resetAllForms()
  }, [guideId, nanoId, queryClient, resetAllForms])

  const value: GuideEditorContextValue = {
    nanoId,
    guideId,
    activeLocale,
    availableLocales,
    setActiveLocale,
    updateAvailableLocales,
    metadata,
    localeData,
    isLoadingLocale,
    stops,
    addStop,
    deleteStop,
    reorderStops,
    attachAssetToGuide,
    detachAssetFromGuide,
    attachAssetToStop,
    detachAssetFromStop,
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
