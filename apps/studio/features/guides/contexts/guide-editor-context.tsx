'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import {
  attachAssetToStop as attachAssetToStopAction,
  createStop,
  deleteStop as deleteStopAction,
  detachAssetFromStop as detachAssetFromStopAction,
  reorderStops as reorderStopsAction,
  updateGuide,
  updateGuideTranslation,
  updateStop,
} from '@valguide/core/features/guides/actions'
import type { AssetWithRole, GuideWithStopsAndAssets, StopWithAssets } from '@valguide/core/features/guides/queries'
import type { GuideTranslationWithVersion, StopTranslationWithVersion } from '@valguide/core/features/guides/schema'
import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/i18n/i18n.config'
import { usePathname, useRouter } from '@valguide/i18n/routing'
// biome-ignore lint/style/noRestrictedImports: useSearchParams is only available from next/navigation
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

const LOCALE_PARAM = 'locale'

function parseLocale(locale: string | undefined): SupportedLocale {
  if (locale && supportedLocales.includes(locale as SupportedLocale)) {
    return locale as SupportedLocale
  }
  return defaultLocale
}

import { toast } from 'sonner'
import type { KeyedMutator } from 'swr'

interface GuideEditorContextValue {
  // State
  guide: GuideWithStopsAndAssets
  activeLocale: SupportedLocale
  selectedStop: StopWithAssets | null
  isDirty: boolean
  isSaving: boolean

  // Guide actions
  updateGuideTranslationData: (locale: SupportedLocale, data: { title: string; description?: string | null }) => void
  updateCoverImage: (assetId: string | null) => void

  // Stop actions
  selectStop: (stop: StopWithAssets | null) => void
  addStop: () => Promise<StopWithAssets | null>
  deleteStop: (stopId: string) => Promise<void>
  reorderStops: (stops: StopWithAssets[]) => Promise<void>
  updateStopTranslationData: (
    stopId: string,
    locale: SupportedLocale,
    data: { title: string; description?: string | null; transcription?: string | null },
  ) => void

  // Asset actions
  attachAssetToStop: (stopId: string, asset: Asset, role: string, locale?: string) => Promise<void>
  detachAssetFromStop: (stopAssetId: string) => Promise<void>

  // Locale actions
  setActiveLocale: (locale: SupportedLocale) => void

  // Save actions
  save: () => Promise<void>
  publish: () => Promise<void>

  // Refetch data from server
  refetch: () => Promise<void>

  // Form dirty registration
  registerFormDirty: (formId: string, isDirty: boolean) => void
  unregisterForm: (formId: string) => void
  resetAllForms: () => void
  registerFormReset: (formId: string, resetFn: () => void) => void

  // Metadata
  lastSaved: Date | null
}

const GuideEditorContext = createContext<GuideEditorContextValue | null>(null)

export function GuideEditorProvider({
  children,
  initialGuide,
  initialLocale,
  onMutate,
}: {
  children: ReactNode
  initialGuide: GuideWithStopsAndAssets
  initialLocale?: string
  onMutate?: KeyedMutator<GuideWithStopsAndAssets | null>
}) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [guide, setGuide] = useState(initialGuide)
  const [activeLocale, setActiveLocaleState] = useState<SupportedLocale>(() => parseLocale(initialLocale))
  const [selectedStop, setSelectedStop] = useState<StopWithAssets | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Form dirty tracking
  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())

  // Cover image dirty tracking (not a form field)
  const initialCoverImageRef = useRef(initialGuide.coverImage)
  const coverImageDirty = guide.coverImage !== initialCoverImageRef.current

  const guideRef = useRef(guide)
  const initialGuideRef = useRef(initialGuide)
  const modifiedTranslationsRef = useRef<Set<string>>(new Set())
  const modifiedStopsRef = useRef<Set<string>>(new Set())
  const onMutateRef = useRef(onMutate)

  // Keep refs in sync
  guideRef.current = guide
  onMutateRef.current = onMutate

  // Computed isDirty from form registrations and cover image
  const isDirty = useMemo(() => {
    return dirtyForms.size > 0 || coverImageDirty
  }, [dirtyForms, coverImageDirty])

  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  // Set active locale and update URL
  const setActiveLocale = useCallback(
    (locale: SupportedLocale) => {
      setActiveLocaleState(locale)
      const params = new URLSearchParams(searchParams.toString())
      if (locale === defaultLocale) {
        params.delete(LOCALE_PARAM)
      } else {
        params.set(LOCALE_PARAM, locale)
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
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

  // Update guide translation
  const updateGuideTranslationData = useCallback(
    (locale: SupportedLocale, data: { title: string; description?: string | null }) => {
      setGuide((prev) => {
        const existingTranslation = prev.translations.find((t) => t.locale === locale)

        if (existingTranslation) {
          // Update draft version if it exists, otherwise update current version
          const versionToUpdate = existingTranslation.draftVersion || existingTranslation.currentVersion
          if (versionToUpdate) {
            return {
              ...prev,
              translations: prev.translations.map((t) =>
                t.locale === locale
                  ? {
                      ...t,
                      draftVersion: t.draftVersion
                        ? { ...t.draftVersion, ...data }
                        : t.currentVersion
                          ? { ...t.currentVersion, ...data, status: 'draft' as const }
                          : undefined,
                    }
                  : t,
              ),
            }
          }

          // Translation exists but has no versions - create a draft version in local state
          const now = new Date()
          return {
            ...prev,
            translations: prev.translations.map((t) =>
              t.locale === locale
                ? {
                    ...t,
                    draftVersion: {
                      id: `temp-version-${locale}`,
                      translationId: t.id,
                      version: 1,
                      status: 'draft' as const,
                      title: data.title,
                      description: data.description ?? null,
                      createdBy: null,
                      createdAt: now,
                      publishedAt: null,
                    },
                  }
                : t,
            ),
          }
        }

        // No translation exists for this locale - create a placeholder in local state
        // Server will create the actual translation + version on save
        const now = new Date()
        const newTranslation: GuideTranslationWithVersion = {
          id: `temp-${locale}`, // Temporary ID, will be replaced after save
          guideId: prev.id,
          locale,
          currentVersionId: null,
          draftVersionId: null,
          currentVersion: null,
          draftVersion: {
            id: `temp-version-${locale}`,
            translationId: `temp-${locale}`,
            version: 1,
            status: 'draft',
            title: data.title,
            description: data.description ?? null,
            createdBy: null,
            createdAt: now,
            publishedAt: null,
          },
          createdAt: now,
          updatedAt: now,
        }

        return {
          ...prev,
          translations: [...prev.translations, newTranslation],
        }
      })
      modifiedTranslationsRef.current.add(locale)
    },
    [],
  )

  // Update cover image
  const updateCoverImage = useCallback((assetId: string | null) => {
    setGuide((prev) => ({
      ...prev,
      coverImage: assetId,
    }))
  }, [])

  // Select stop
  const selectStop = useCallback((stop: StopWithAssets | null) => {
    setSelectedStop(stop)
  }, [])

  // Add stop - returns the new stop so caller can navigate
  const addStop = useCallback(async (): Promise<StopWithAssets | null> => {
    try {
      const newStopWithTranslations = await createStop({
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
      })

      const newStop: StopWithAssets = { ...newStopWithTranslations, assets: [] }

      const updatedGuide = {
        ...guide,
        stops: [...guide.stops, newStop],
      }
      setGuide(updatedGuide)

      // Sync SWR cache so page.client.tsx sees the new stop
      onMutateRef.current?.(updatedGuide)

      toast.success(t('stops.actions.addSuccess'))
      return newStop
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error(t('stops.actions.addError'))
      return null
    }
  }, [guide, t])

  // Delete stop
  const deleteStop = useCallback(
    async (stopId: string) => {
      try {
        await deleteStopAction(stopId)

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
    [guide.stops, selectedStop?.id, t],
  )

  // Reorder stops
  const reorderStops = useCallback(
    async (stops: StopWithAssets[]) => {
      try {
        await reorderStopsAction(stops.map((s, idx) => ({ id: s.id, order: idx })))

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

  // Update stop translation
  const updateStopTranslationData = useCallback(
    (
      stopId: string,
      locale: SupportedLocale,
      data: { title: string; description?: string | null; transcription?: string | null },
    ) => {
      setGuide((prev) => ({
        ...prev,
        stops: prev.stops.map((stop: StopWithAssets): StopWithAssets => {
          if (stop.id !== stopId) return stop

          const existingTranslation = stop.translations.find((t) => t.locale === locale)

          if (existingTranslation) {
            // Update draft version if it exists, otherwise update current version
            const versionToUpdate = existingTranslation.draftVersion || existingTranslation.currentVersion
            if (versionToUpdate) {
              return {
                ...stop,
                assets: stop.assets,
                translations: stop.translations.map((t) =>
                  t.locale === locale
                    ? {
                        ...t,
                        draftVersion: t.draftVersion
                          ? { ...t.draftVersion, ...data }
                          : t.currentVersion
                            ? { ...t.currentVersion, ...data, status: 'draft' as const }
                            : undefined,
                      }
                    : t,
                ),
              }
            }

            // Translation exists but has no versions - create a draft version in local state
            const now = new Date()
            return {
              ...stop,
              assets: stop.assets,
              translations: stop.translations.map((t) =>
                t.locale === locale
                  ? {
                      ...t,
                      draftVersion: {
                        id: `temp-version-${stopId}-${locale}`,
                        translationId: t.id,
                        version: 1,
                        status: 'draft' as const,
                        title: data.title,
                        description: data.description ?? null,
                        transcription: data.transcription ?? null,
                        createdBy: null,
                        createdAt: now,
                        publishedAt: null,
                      },
                    }
                  : t,
              ),
            }
          }

          // No translation exists for this locale - create a placeholder in local state
          // Server will create the actual translation + version on save
          const now = new Date()
          const newTranslation: StopTranslationWithVersion = {
            id: `temp-${stopId}-${locale}`,
            stopId: stop.id,
            locale,
            currentVersionId: null,
            draftVersionId: null,
            currentVersion: null,
            draftVersion: {
              id: `temp-version-${stopId}-${locale}`,
              translationId: `temp-${stopId}-${locale}`,
              version: 1,
              status: 'draft',
              title: data.title,
              description: data.description ?? null,
              transcription: data.transcription ?? null,
              createdBy: null,
              createdAt: now,
              publishedAt: null,
            },
            createdAt: now,
            updatedAt: now,
          }

          return {
            ...stop,
            assets: stop.assets,
            translations: [...stop.translations, newTranslation],
          }
        }),
      }))

      // Update selectedStop if it's the one being edited
      setSelectedStop((prev) => {
        if (!prev || prev.id !== stopId) return prev

        const existingTranslation = prev.translations.find((t) => t.locale === locale)

        if (existingTranslation) {
          const versionToUpdate = existingTranslation.draftVersion || existingTranslation.currentVersion
          if (versionToUpdate) {
            return {
              ...prev,
              translations: prev.translations.map((t) =>
                t.locale === locale
                  ? {
                      ...t,
                      draftVersion: t.draftVersion
                        ? { ...t.draftVersion, ...data }
                        : t.currentVersion
                          ? { ...t.currentVersion, ...data, status: 'draft' as const }
                          : undefined,
                    }
                  : t,
              ),
            }
          }
        }
        return prev
      })

      modifiedStopsRef.current.add(`${stopId}:${locale}`)
    },
    [],
  )

  // Asset actions
  const attachAssetToStop = useCallback(
    async (stopId: string, asset: Asset, role: string, locale?: string) => {
      try {
        await attachAssetToStopAction({
          stopId,
          assetId: asset.id,
          role,
          locale,
          order: 0, // Will be incremented server-side based on existing assets
        })

        // Optimistically update local state with the new asset
        const assetWithRole: AssetWithRole = {
          ...asset,
          role,
          order: 0,
          locale: locale ?? null,
        }

        setGuide((prev) => ({
          ...prev,
          stops: prev.stops.map((stop: StopWithAssets): StopWithAssets => {
            if (stop.id !== stopId) return stop
            return {
              ...stop,
              assets: [...stop.assets, assetWithRole],
            }
          }),
        }))

        toast.success(t('stops.assets.attachSuccess'))
      } catch (error) {
        console.error('Failed to attach asset:', error)
        toast.error(t('stops.assets.attachError'))
      }
    },
    [t],
  )

  const detachAssetFromStop = useCallback(
    async (stopAssetId: string) => {
      try {
        await detachAssetFromStopAction(stopAssetId)
        toast.success(t('stops.assets.removeSuccess'))
      } catch (error) {
        console.error('Failed to detach asset:', error)
        toast.error(t('stops.assets.removeError'))
      }
    },
    [t],
  )

  // Save
  const save = useCallback(async () => {
    if (!isDirtyRef.current) return

    setIsSaving(true)
    try {
      const currentGuide = guideRef.current
      const modifiedTranslations = modifiedTranslationsRef.current
      const modifiedStops = modifiedStopsRef.current

      // Save guide metadata if cover image changed
      if (currentGuide.coverImage !== initialGuideRef.current.coverImage) {
        await updateGuide({
          id: currentGuide.id,
          coverImage: currentGuide.coverImage,
          published: currentGuide.published,
          organizationId: currentGuide.organizationId,
        })
      }

      // Only save modified translations
      const savedTranslationVersionIds: Record<string, string> = {}
      for (const locale of modifiedTranslations) {
        const translation = currentGuide.translations.find((t) => t.locale === locale)

        if (translation) {
          // Get content from draft version or current version
          const version = translation.draftVersion || translation.currentVersion
          if (version) {
            const result = await updateGuideTranslation({
              guideId: currentGuide.id,
              locale: translation.locale,
              title: version.title,
              description: version.description || '',
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
              const result = await updateStop({
                stopId: stop.id,
                locale: translation.locale,
                title: version.title,
                description: version.description || '',
                transcription: version.transcription || '',
              })
              if (result.versionId) {
                savedStopVersionIds[key] = result.versionId
              }
            }
          }
        }
      }

      // Clear tracking sets
      modifiedTranslationsRef.current.clear()
      modifiedStopsRef.current.clear()

      // Update local state with draft version IDs so publish button appears
      if (Object.keys(savedTranslationVersionIds).length > 0 || Object.keys(savedStopVersionIds).length > 0) {
        setGuide((prev) => ({
          ...prev,
          translations: prev.translations.map((t) => {
            const versionId = savedTranslationVersionIds[t.locale]
            if (versionId) {
              return {
                ...t,
                draftVersionId: versionId,
              }
            }
            return t
          }),
          stops: prev.stops.map((s) => ({
            ...s,
            translations: s.translations.map((t) => {
              const key = `${s.id}:${t.locale}`
              const versionId = savedStopVersionIds[key]
              if (versionId) {
                return {
                  ...t,
                  draftVersionId: versionId,
                }
              }
              return t
            }),
          })),
        }))
      }

      // Update initial refs for next comparison
      initialGuideRef.current = currentGuide
      initialCoverImageRef.current = currentGuide.coverImage

      // Reset all forms to update their baselines
      resetAllForms()

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
  }, [t, resetAllForms])

  // Publish
  const publish = useCallback(async () => {
    await save()

    try {
      await updateGuide({
        id: guide.id,
        published: new Date(),
        coverImage: guide.coverImage,
        organizationId: guide.organizationId,
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
  }, [guide.id, guide.coverImage, guide.organizationId, save, t])

  // Refetch data from server (revalidates SWR and updates local state)
  const refetch = useCallback(async () => {
    const freshData = await onMutateRef.current?.()
    if (freshData) {
      setGuide(freshData)
      initialGuideRef.current = freshData
      initialCoverImageRef.current = freshData.coverImage
      resetAllForms()
    }
  }, [resetAllForms])

  const value: GuideEditorContextValue = {
    guide,
    activeLocale,
    selectedStop,
    isDirty,
    isSaving,
    updateGuideTranslationData,
    updateCoverImage,
    selectStop,
    addStop,
    deleteStop,
    reorderStops,
    updateStopTranslationData,
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

export function useGuideEditor() {
  const context = useContext(GuideEditorContext)
  if (!context) {
    throw new Error('useGuideEditor must be used within GuideEditorProvider')
  }
  return context
}
