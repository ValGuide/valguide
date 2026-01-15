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
import type { AssetWithRole, GuideWithStopsAndAssets, StopWithAssets } from '@valguide/core/features/guides/types'
import { defaultLocale } from '@valguide/i18n/i18n.config'

type ContentLocale = string

import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouter, useSearch } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

const LOCALE_PARAM = 'locale'

function parseLocale(locale: string | undefined, availableLocales: string[]): ContentLocale {
  if (locale && availableLocales.includes(locale)) {
    return locale
  }
  return availableLocales[0] ?? defaultLocale
}

type MutateFn = (
  data?: GuideWithStopsAndAssets | null | ((prev?: GuideWithStopsAndAssets | null) => GuideWithStopsAndAssets | null),
) => Promise<GuideWithStopsAndAssets | null | undefined>

export { GuideEditorContext, type GuideEditorContextValue }

export function GuideEditorProvider({
  children,
  initialGuide,
  initialLocale,
  onMutate,
}: {
  children: ReactNode
  initialGuide: GuideWithStopsAndAssets
  initialLocale?: string
  onMutate?: MutateFn
}) {
  const t = useTranslations()
  const router = useRouter()
  const location = useLocation()
  const pathname = location.pathname
  const searchParams = useSearch({ strict: false })
  const queryClient = useQueryClient()
  const [guide, setGuide] = useState(initialGuide)
  const [activeLocale, setActiveLocaleState] = useState<ContentLocale>(() =>
    parseLocale(initialLocale, initialGuide.availableLocales ?? ['en', 'de', 'rm']),
  )
  const [selectedStop, setSelectedStop] = useState<StopWithAssets | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Form dirty tracking
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formSaveResetFnsRef = useRef<Map<string, () => void>>(new Map())

  const guideRef = useRef(guide)
  const initialGuideRef = useRef(initialGuide)
  const modifiedTranslationsRef = useRef<Set<string>>(new Set())
  const modifiedStopsRef = useRef<Set<string>>(new Set())
  const onMutateRef = useRef(onMutate)

  // Keep refs in sync
  guideRef.current = guide
  onMutateRef.current = onMutate

  // Track modified translations for dirty state (survives locale switches)
  const [modifiedTranslations, setModifiedTranslations] = useState<Set<string>>(new Set())
  const [modifiedStops, setModifiedStops] = useState<Set<string>>(new Set())

  // Computed isDirty from form registrations, modified translations/stops
  // Note: Assets are saved immediately, so they don't affect dirty state
  const isDirty = useMemo(() => {
    return dirtyForms.size > 0 || modifiedTranslations.size > 0 || modifiedStops.size > 0
  }, [dirtyForms, modifiedTranslations, modifiedStops])

  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  // Set active locale and update URL
  const setActiveLocale = useCallback(
    (locale: ContentLocale) => {
      const availableLocales = guideRef.current.availableLocales ?? ['en', 'de', 'rm']
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
    [pathname, router, searchParams],
  )

  // Form registration functions
  const registerFormDirty = useCallback((formId: string, formIsDirty: boolean) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      if (formIsDirty) {
        next.add(formId)
      } else {
        next.delete(formId)
      }
      return next
    })
  }, [])

  const unregisterForm = useCallback((formId: string) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      next.delete(formId)
      return next
    })
    formResetFnsRef.current.delete(formId)
    formSaveResetFnsRef.current.delete(formId)
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

  // Update guide available locales
  const updateGuideAvailableLocales = useCallback(
    async (locales: string[]) => {
      try {
        await updateGuideFn({
          data: {
            id: guide.id,
            availableLocales: locales,
            organizationId: guide.organizationId,
          },
        })

        setGuide((prev) => ({
          ...prev,
          availableLocales: locales,
        }))

        if (!locales.includes(activeLocale)) {
          const newLocale = locales[0] ?? defaultLocale
          setActiveLocaleState(newLocale)
        }

        toast.success(t('guides.locales.updateSuccess'))
      } catch (error) {
        console.error('Failed to update available locales:', error)
        toast.error(t('guides.locales.updateError'))
      }
    },
    [guide.id, guide.organizationId, activeLocale],
  )

  // Select stop
  const selectStop = useCallback((stop: StopWithAssets | null) => {
    setSelectedStop(stop)
  }, [])

  // Add stop - returns the new stop so caller can navigate
  const addStop = useCallback(async (): Promise<StopWithAssets | null> => {
    try {
      const newStopWithTranslations = await createStopFn({
        data: {
          guideId: guide.id,
          position: guide.stops.length,
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

      const newStop: StopWithAssets = { ...newStopWithTranslations, assets: [] }

      const updatedGuide = {
        ...guide,
        stops: [...guide.stops, newStop],
      }
      setGuide(updatedGuide)
      onMutateRef.current?.(updatedGuide)
      toast.success(t('stops.actions.addSuccess'))
      return newStop
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error(t('stops.actions.addError'))
      return null
    }
  }, [guide])

  // Delete stop
  const deleteStop = useCallback(
    async (stopId: string) => {
      try {
        await deleteStopFn({ data: { stopId } })

        setGuide((prev) => ({
          ...prev,
          stops: prev.stops.filter((s): s is StopWithAssets => s.id !== stopId),
        }))

        if (selectedStop?.id === stopId) {
          setSelectedStop(guide.stops[0] || null)
        }

        toast.success(t('stops.actions.deleteSuccess'))
      } catch (error) {
        console.error('Failed to delete stop:', error)
        toast.error(t('stops.actions.deleteError'))
      }
    },
    [guide.stops, selectedStop?.id],
  )

  // Reorder stops
  const reorderStops = useCallback(
    async (stops: StopWithAssets[]) => {
      try {
        await reorderStopsFn({ data: stops.map((s, idx) => ({ id: s.id, order: idx })) })

        setGuide((prev) => ({
          ...prev,
          stops,
        }))

        toast.success(t('stops.actions.reorderSuccess'))
      } catch (error) {
        console.error('Failed to reorder stops:', error)
        toast.error(t('stops.actions.reorderError'))
      }
    },
    [t],
  )

  // Guide asset actions (immediate save - global assets)
  const attachAssetToGuide = useCallback(
    async (asset: Asset, role: string) => {
      try {
        const result = await attachAssetToGuideFn({
          data: {
            guideId: guide.id,
            assetId: asset.id,
            role,
            locale: undefined,
            order: 0,
          },
        })

        if (!result) {
          throw new Error('Failed to attach asset to guide')
        }

        const assetWithRole: AssetWithRole = {
          ...asset,
          guideAssetId: result.id,
          role,
          order: 0,
          locale: null,
        }

        setGuide((prev) => ({
          ...prev,
          assets: [...prev.assets, assetWithRole],
        }))

        await queryClient.invalidateQueries({ queryKey: ['guides'] })
        toast.success(t('guides.assets.attachSuccess'))
      } catch (error) {
        console.error('Failed to attach asset to guide:', error)
        toast.error(t('guides.assets.attachError'))
      }
    },
    [guide.id, queryClient],
  )

  const detachAssetFromGuide = useCallback(
    async (assetId: string, guideAssetId: string) => {
      try {
        setGuide((prev) => ({
          ...prev,
          assets: prev.assets.filter((a) => a.id !== assetId),
        }))

        await detachAssetFromGuideFn({ data: { guideAssetId } })
        await queryClient.invalidateQueries({ queryKey: ['guides'] })
        toast.success(t('guides.assets.removeSuccess'))
      } catch (error) {
        console.error('Failed to detach asset from guide:', error)
        toast.error(t('guides.assets.removeError'))
      }
    },
    [queryClient],
  )

  // Stop asset actions (immediate save)
  const attachAssetToStop = useCallback(
    async (stopId: string, asset: Asset, role: string, locale?: string | null) => {
      try {
        const result = await attachAssetToStopFn({
          data: {
            stopId,
            assetId: asset.id,
            role,
            locale: locale ?? undefined,
            order: 0,
          },
        })

        if (!result) {
          throw new Error('Failed to attach asset to stop')
        }

        const assetWithRole: AssetWithRole = {
          ...asset,
          stopAssetId: result.id,
          role,
          order: 0,
          locale: locale ?? null,
        }

        const newGuide = {
          ...guide,
          stops: guide.stops.map((stop: StopWithAssets): StopWithAssets => {
            if (stop.id !== stopId) return stop
            return {
              ...stop,
              assets: [...stop.assets, assetWithRole],
            }
          }),
        }

        setGuide(newGuide)
        queryClient.setQueryData(['guide', guide.nanoId], newGuide)
        await queryClient.invalidateQueries({ queryKey: ['guides'] })
        toast.success(t('stops.assets.attachSuccess'))
      } catch (error) {
        console.error('Failed to attach asset:', error)
        toast.error(t('stops.assets.attachError'))
      }
    },
    [guide, queryClient],
  )

  const detachAssetFromStop = useCallback(
    async (stopId: string, assetId: string, stopAssetId: string) => {
      try {
        // Update UI immediately
        const newGuide = {
          ...guide,
          stops: guide.stops.map((s) =>
            s.id === stopId
              ? {
                  ...s,
                  assets: s.assets.filter((a) => a.id !== assetId),
                }
              : s,
          ),
        }

        setGuide(newGuide)
        queryClient.setQueryData(['guide', guide.nanoId], newGuide)

        // Delete from DB
        await detachAssetFromStopFn({ data: { stopAssetId } })
        await queryClient.invalidateQueries({ queryKey: ['guides'] })
        toast.success(t('stops.assets.removeSuccess'))
      } catch (error) {
        console.error('Failed to detach asset:', error)
        toast.error(t('stops.assets.removeError'))
      }
    },
    [guide, queryClient],
  )

  // Save
  const save = useCallback(async () => {
    if (!isDirtyRef.current) return

    setIsSaving(true)
    try {
      const currentGuide = guideRef.current
      const modifiedTranslations = modifiedTranslationsRef.current
      const modifiedStops = modifiedStopsRef.current

      // Only save modified translations
      const savedTranslationVersionIds: Record<string, string> = {}
      for (const locale of modifiedTranslations) {
        const translation = currentGuide.translations.find((t) => t.locale === locale)

        if (translation) {
          // Get content from draft version or current version
          const version = translation.draftVersion || translation.currentVersion
          if (version) {
            const result = await updateGuideTranslationFn({
              data: {
                guideId: currentGuide.id,
                locale: translation.locale,
                title: version.title,
                description: version.description || '',
              },
            })
            if (result.versionId) {
              savedTranslationVersionIds[locale] = result.versionId
            }
          }
        }
      }

      // Only save modified stop translations
      const savedStopVersionIds: Record<string, string> = {}
      for (const key of modifiedStops) {
        const [stopId, locale] = key.split(':')
        const stop = currentGuide.stops.find((s) => s.id === stopId)
        if (stop) {
          const translation = stop.translations.find((t) => t.locale === locale)
          if (translation) {
            // Get content from draft version or current version
            const version = translation.draftVersion || translation.currentVersion
            if (version) {
              const result = await updateStopFn({
                data: {
                  stopId: stop.id,
                  locale: translation.locale,
                  title: version.title,
                  description: version.description || '',
                  transcription: version.transcription || '',
                },
              })
              if (result.versionId) {
                savedStopVersionIds[key] = result.versionId
              }
            }
          }
        }
      }

      // Clear tracking sets and state
      modifiedTranslationsRef.current.clear()
      modifiedStopsRef.current.clear()
      setModifiedTranslations(new Set())
      setModifiedStops(new Set())

      // Update local state with draft version IDs so publish button appears
      if (Object.keys(savedTranslationVersionIds).length > 0 || Object.keys(savedStopVersionIds).length > 0) {
        setGuide((prev) => ({
          ...prev,
          translations: prev.translations.map((t) => {
            const versionId = savedTranslationVersionIds[t.locale]
            if (versionId && t.draftVersion) {
              // Update both draftVersionId and draftVersion.id to keep them in sync
              return {
                ...t,
                draftVersionId: versionId,
                draftVersion: {
                  ...t.draftVersion,
                  id: versionId,
                },
              }
            }
            return t
          }),
          stops: prev.stops.map((s) => ({
            ...s,
            translations: s.translations.map((t) => {
              const key = `${s.id}:${t.locale}`
              const versionId = savedStopVersionIds[key]
              if (versionId && t.draftVersion) {
                // Update both draftVersionId and draftVersion.id to keep them in sync
                return {
                  ...t,
                  draftVersionId: versionId,
                  draftVersion: {
                    ...t.draftVersion,
                    id: versionId,
                  },
                }
              }
              return t
            }),
          })),
        }))
      }

      // Update initial refs for next comparison
      initialGuideRef.current = currentGuide

      // Reset all forms to mark as clean (using current form values, not prop values)
      resetAllFormsAfterSave()

      // Update SWR cache so navigation shows fresh data
      onMutateRef.current?.(currentGuide)

      setLastSaved(new Date())
      toast.success(t('common.saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [t, resetAllFormsAfterSave])

  // Publish
  const publish = useCallback(async () => {
    await save()

    try {
      await updateGuideFn({
        data: {
          id: guide.id,
          published: new Date(),
          organizationId: guide.organizationId,
        },
      })

      setGuide((prev) => ({
        ...prev,
        published: new Date(),
      }))

      toast.success(t('guides.publish.guidePublished'))
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('guides.publish.guidePublishError'))
    }
  }, [guide.id, guide.organizationId, save])

  // Refetch data from server (revalidates SWR and updates local state)
  const refetch = useCallback(async () => {
    const result = await onMutateRef.current?.()
    if (result) {
      setGuide(result)
      initialGuideRef.current = result
      modifiedTranslationsRef.current.clear()
      modifiedStopsRef.current.clear()
      setModifiedTranslations(new Set())
      setModifiedStops(new Set())
      resetAllForms()
    }
  }, [resetAllForms])

  const value: GuideEditorContextValue = {
    guide,
    activeLocale,
    selectedStop,
    isDirty,
    isSaving,
    updateGuideAvailableLocales,
    attachAssetToGuide,
    detachAssetFromGuide,
    selectStop,
    addStop,
    deleteStop,
    reorderStops,
    attachAssetToStop,
    detachAssetFromStop,
    setActiveLocale,
    save,
    publish,
    refetch,
    registerFormDirty,
    unregisterForm,
    resetAllForms,
    registerFormReset,
    lastSaved,
  }

  return <GuideEditorContext.Provider value={value}>{children}</GuideEditorContext.Provider>
}

export { useGuideEditor } from './guide-editor-types'
