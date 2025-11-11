'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import type {
  GuideWithStops,
  StopWithTranslations,
  GuideTranslation,
  StopTranslation,
} from '@valguide/core/features/guides/schema'
import type { Asset } from '@valguide/core/features/assets/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
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
    data: Partial<Omit<GuideTranslation, 'id' | 'guideId' | 'createdAt' | 'updatedAt'>>,
  ) => void
  updateCoverImage: (assetId: string) => void

  // Stop actions
  selectStop: (stop: StopWithTranslations | null) => void
  addStop: () => Promise<void>
  deleteStop: (stopId: string) => Promise<void>
  reorderStops: (stops: StopWithTranslations[]) => Promise<void>
  updateStopTranslationData: (
    stopId: string,
    locale: SupportedLocale,
    data: Partial<Omit<StopTranslation, 'id' | 'stopId' | 'createdAt' | 'updatedAt'>>,
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
  userId,
}: {
  children: ReactNode
  initialGuide: GuideWithStops
  userId: string
}) {
  const [guide, setGuide] = useState(initialGuide)
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('en')
  const [selectedStop, setSelectedStop] = useState<StopWithTranslations | null>(initialGuide.stops?.[0] || null)
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
    (locale: SupportedLocale, data: Partial<Omit<GuideTranslation, 'id' | 'guideId' | 'createdAt' | 'updatedAt'>>) => {
      setGuide((prev) => {
        const existingTranslation = prev.translations.find((t) => t.locale === locale)

        if (existingTranslation) {
          // Update existing translation
          return {
            ...prev,
            translations: prev.translations.map((t) => (t.locale === locale ? { ...t, ...data } : t)),
          }
        } else {
          // Create new translation
          const newTranslation: GuideTranslation = {
            id: crypto.randomUUID(),
            guideId: prev.id,
            locale,
            title: data.title || '',
            description: data.description || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          return {
            ...prev,
            translations: [...prev.translations, newTranslation],
          }
        }
      })
      modifiedTranslationsRef.current.add(locale)
      setIsDirty(true)
    },
    [],
  )

  // Update cover image
  const updateCoverImage = useCallback((assetId: string) => {
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
        userId,
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
      toast.success('Stop added')
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error('Failed to add stop')
    }
  }, [guide.id, guide.stops.length, userId])

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

        toast.success('Stop deleted')
      } catch (error) {
        console.error('Failed to delete stop:', error)
        toast.error('Failed to delete stop')
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

      toast.success('Stops reordered')
    } catch (error) {
      console.error('Failed to reorder stops:', error)
      toast.error('Failed to reorder stops')
    }
  }, [])

  // Update stop translation
  const updateStopTranslationData = useCallback(
    (
      stopId: string,
      locale: SupportedLocale,
      data: Partial<Omit<StopTranslation, 'id' | 'stopId' | 'createdAt' | 'updatedAt'>>,
    ) => {
      setGuide((prev) => ({
        ...prev,
        stops: prev.stops.map((stop) => {
          if (stop.id !== stopId) return stop

          const existingTranslation = stop.translations.find((t) => t.locale === locale)

          if (existingTranslation) {
            // Update existing translation
            return {
              ...stop,
              translations: stop.translations.map((t) => (t.locale === locale ? { ...t, ...data } : t)),
            }
          } else {
            // Create new translation
            const newTranslation: StopTranslation = {
              id: crypto.randomUUID(),
              stopId,
              locale,
              title: data.title || '',
              description: data.description || null,
              transcription: data.transcription || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            return {
              ...stop,
              translations: [...stop.translations, newTranslation],
            }
          }
        }),
      }))

      // Update selectedStop if it's the one being edited
      setSelectedStop((prev) => {
        if (!prev || prev.id !== stopId) return prev

        const existingTranslation = prev.translations.find((t) => t.locale === locale)

        if (existingTranslation) {
          return {
            ...prev,
            translations: prev.translations.map((t) => (t.locale === locale ? { ...t, ...data } : t)),
          }
        } else {
          const newTranslation: StopTranslation = {
            id: crypto.randomUUID(),
            stopId,
            locale,
            title: data.title || '',
            description: data.description || null,
            transcription: data.transcription || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          return {
            ...prev,
            translations: [...prev.translations, newTranslation],
          }
        }
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
      toast.success('Asset attached')
    } catch (error) {
      console.error('Failed to attach asset:', error)
      toast.error('Failed to attach asset')
    }
  }, [])

  const detachAssetFromStop = useCallback(async (stopAssetId: string) => {
    try {
      await detachAssetFromStopAction(stopAssetId)

      setIsDirty(true)
      toast.success('Asset removed')
    } catch (error) {
      console.error('Failed to detach asset:', error)
      toast.error('Failed to remove asset')
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
          userId,
        })
      }

      // Only save modified translations
      for (const locale of modifiedTranslations) {
        const translation = currentGuide.translations.find((t) => t.locale === locale)
        if (translation) {
          await updateGuideTranslation({
            guideId: currentGuide.id,
            locale: translation.locale,
            title: translation.title,
            description: translation.description || '',
          })
        }
      }

      // Only save modified stop translations
      for (const key of modifiedStops) {
        const [stopId, locale] = key.split(':')
        const stop = currentGuide.stops.find((s) => s.id === stopId)
        if (stop) {
          const translation = stop.translations.find((t) => t.locale === locale)
          if (translation) {
            await updateStop({
              stopId: stop.id,
              locale: translation.locale,
              title: translation.title,
              description: translation.description || '',
              transcription: translation.transcription || '',
            })
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
      toast.success('Saved')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [userId])

  // Publish
  const publish = useCallback(async () => {
    await save()

    try {
      await updateGuide({
        id: guide.id,
        published: new Date(),
        coverImage: guide.coverImage,
        organizationId: guide.organizationId,
        userId,
      })

      setGuide((prev) => ({
        ...prev,
        published: new Date(),
      }))

      toast.success('Guide published')
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error('Failed to publish')
    }
  }, [guide.id, guide.coverImage, guide.organizationId, save, userId])

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
