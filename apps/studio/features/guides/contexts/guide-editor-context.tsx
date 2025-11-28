'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import type {
  GuideWithStops,
  StopWithTranslations,
  GuideTranslationWithVersion,
  StopTranslationWithVersion,
} from '@valguide/core/features/guides/schema'
import type { Asset } from '@valguide/core/features/assets/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { useTranslations } from 'next-intl'
import {
  updateGuide,
  updateGuideTranslation,
  createStop,
  updateStop,
  deleteStop as deleteStopAction,
  reorderStops as reorderStopsAction,
  attachAssetToStop as attachAssetToStopAction,
  detachAssetFromStop as detachAssetFromStopAction,
  attachAssetToGuide as attachAssetToGuideAction,
  detachAssetFromGuide as detachAssetFromGuideAction,
} from '@valguide/core/features/guides/actions'
import { toast } from 'sonner'

interface GuideEditorContextValue {
  // State
  guide: GuideWithStops
  activeLocale: SupportedLocale
  selectedStop: StopWithTranslations | null
  isDirty: boolean
  isSaving: boolean

  // Guide actions
  updateGuideTranslationData: (
    locale: SupportedLocale,
    data: { title: string; description?: string | null },
  ) => void
  updateCoverImage: (assetId: string | null) => void

  // Stop actions
  selectStop: (stop: StopWithTranslations | null) => void
  addStop: () => Promise<void>
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
}: {
  children: ReactNode
  initialGuide: GuideWithStops
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

  // Keep refs in sync
  guideRef.current = guide
  isDirtyRef.current = isDirty

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
                  : t
              ),
            }
          }
        }
        // If no translation exists, just mark as modified - server will create it
        return prev
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

  // Add stop
  const addStop = useCallback(async () => {
    try {
      const newStopWithTranslations = await createStop({
        guideId: guide.id,
        order: guide.stops.length,
        translations: [
          {
            locale: 'en',
            title: 'New Stop',
            description: '',
            transcription: '',
          },
        ],
      })

      setGuide((prev) => ({
        ...prev,
        stops: [...prev.stops, newStopWithTranslations as StopWithTranslations],
      }))

      setSelectedStop(newStopWithTranslations as StopWithTranslations)
      toast.success(t('stops.actions.addSuccess'))
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error(t('stops.actions.addError'))
    }
  }, [guide.id, guide.stops.length])

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
    [guide.stops, selectedStop?.id],
  )

  // Reorder stops
  const reorderStops = useCallback(async (stops: StopWithTranslations[]) => {
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
  }, [])

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
                    : t
                ),
              }
            }
          }
          return stop
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
                  : t
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
  const attachAssetToStop = useCallback(async (stopId: string, assetId: string, role: string, locale?: string) => {
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
  }, [])

  const detachAssetFromStop = useCallback(async (stopAssetId: string) => {
    try {
      await detachAssetFromStopAction(stopAssetId)

      setIsDirty(true)
      toast.success(t('stops.assets.removeSuccess'))
    } catch (error) {
      console.error('Failed to detach asset:', error)
      toast.error(t('stops.assets.removeError'))
    }
  }, [])

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
      for (const locale of modifiedTranslations) {
        const translation = currentGuide.translations.find((t) => t.locale === locale)
        if (translation) {
          // Get content from draft version or current version
          const version = translation.draftVersion || translation.currentVersion
          if (version) {
            await updateGuideTranslation({
              guideId: currentGuide.id,
              locale: translation.locale,
              title: version.title,
              description: version.description || '',
            })
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

      // Update initial guide for next comparison
      initialGuideRef.current = currentGuide

      setIsDirty(false)
      setLastSaved(new Date())
      toast.success(t('common.saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(t('common.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [])

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
  }, [guide.id, guide.coverImage, guide.organizationId, save])

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
