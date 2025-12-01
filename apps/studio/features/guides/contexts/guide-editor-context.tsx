'use client'

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
import type {
  GuideTranslationWithVersion,
  GuideWithStops,
  StopTranslationWithVersion,
  StopWithTranslations,
} from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { useTranslations } from 'next-intl'
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { KeyedMutator } from 'swr'

interface GuideEditorContextValue {
  // State
  guide: GuideWithStops
  activeLocale: SupportedLocale
  selectedStop: StopWithTranslations | null
  isDirty: boolean
  isSaving: boolean

  // Guide actions
  updateGuideTranslationData: (locale: SupportedLocale, data: { title: string; description?: string | null }) => void
  updateCoverImage: (assetId: string | null) => void

  // Stop actions
  selectStop: (stop: StopWithTranslations | null) => void
  addStop: () => Promise<StopWithTranslations | null>
  deleteStop: (stopId: string) => Promise<void>
  reorderStops: (stops: StopWithTranslations[]) => Promise<void>
  updateStopTranslationData: (
    stopId: string,
    locale: SupportedLocale,
    data: { title: string; description?: string | null; transcription?: string | null },
  ) => void

  // Asset actions (placeholder for Week 2)
  attachAssetToStop: (stopId: string, assetId: string, role: string, locale?: string) => Promise<void>
  detachAssetFromStop: (stopAssetId: string) => Promise<void>

  // Locale actions
  setActiveLocale: (locale: SupportedLocale) => void

  // Save actions
  save: () => Promise<void>
  publish: () => Promise<void>

  // Metadata
  lastSaved: Date | null
}

const GuideEditorContext = createContext<GuideEditorContextValue | null>(null)

export function GuideEditorProvider({
  children,
  initialGuide,
  onMutate,
}: {
  children: ReactNode
  initialGuide: GuideWithStops
  onMutate?: KeyedMutator<GuideWithStops | null>
}) {
  const t = useTranslations()
  const [guide, setGuide] = useState(initialGuide)
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('en')
  const [selectedStop, setSelectedStop] = useState<StopWithTranslations | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const guideRef = useRef(guide)
  const isDirtyRef = useRef(isDirty)
  const initialGuideRef = useRef(initialGuide)
  const modifiedTranslationsRef = useRef<Set<string>>(new Set())
  const modifiedStopsRef = useRef<Set<string>>(new Set())
  const onMutateRef = useRef(onMutate)

  // Keep refs in sync
  guideRef.current = guide
  isDirtyRef.current = isDirty
  onMutateRef.current = onMutate

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
      setIsDirty(true)
    },
    [],
  )

  // Update cover image
  const updateCoverImage = useCallback((assetId: string | null) => {
    setGuide((prev) => ({
      ...prev,
      coverImage: assetId,
    }))
    setIsDirty(true)
  }, [])

  // Select stop
  const selectStop = useCallback((stop: StopWithTranslations | null) => {
    setSelectedStop(stop)
  }, [])

  // Add stop - returns the new stop so caller can navigate
  const addStop = useCallback(async (): Promise<StopWithTranslations | null> => {
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

      const newStop = newStopWithTranslations as StopWithTranslations

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
  }, [guide.id, guide.stops.length, t])

  // Delete stop
  const deleteStop = useCallback(
    async (stopId: string) => {
      try {
        await deleteStopAction(stopId)

        setGuide((prev) => ({
          ...prev,
          stops: prev.stops.filter((s) => s.id !== stopId),
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
    async (stops: StopWithTranslations[]) => {
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
        stops: prev.stops.map((stop) => {
          if (stop.id !== stopId) return stop

          const existingTranslation = stop.translations.find((t) => t.locale === locale)

          if (existingTranslation) {
            // Update draft version if it exists, otherwise update current version
            const versionToUpdate = existingTranslation.draftVersion || existingTranslation.currentVersion
            if (versionToUpdate) {
              return {
                ...stop,
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
      setIsDirty(true)
    },
    [],
  )

  // Asset actions
  const attachAssetToStop = useCallback(
    async (stopId: string, assetId: string, role: string, locale?: string) => {
      try {
        await attachAssetToStopAction({
          stopId,
          assetId,
          role,
          locale,
          order: 0, // Will be incremented server-side based on existing assets
        })

        // Optimistically update UI - will be replaced by refetch
        setIsDirty(true)
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

        setIsDirty(true)
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

        console.info('translation', translation)
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
      for (const key of modifiedStops) {
        const [stopId, locale] = key.split(':')
        const stop = currentGuide.stops.find((s) => s.id === stopId)
        if (stop) {
          const translation = stop.translations.find((t) => t.locale === locale)
          if (translation) {
            // Get content from draft version or current version
            const version = translation.draftVersion || translation.currentVersion
            if (version) {
              await updateStop({
                stopId: stop.id,
                locale: translation.locale,
                title: version.title,
                description: version.description || '',
                transcription: version.transcription || '',
              })
            }
          }
        }
      }

      // Clear tracking sets
      modifiedTranslationsRef.current.clear()
      modifiedStopsRef.current.clear()

      // Update local state with draft version IDs so publish button appears
      if (Object.keys(savedTranslationVersionIds).length > 0) {
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
        }))
      }

      // Update initial guide for next comparison
      initialGuideRef.current = currentGuide

      // Update SWR cache so navigation shows fresh data
      onMutateRef.current?.(currentGuide)

      setIsDirty(false)
      setLastSaved(new Date())
      toast.success(t('common.saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [t])

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
