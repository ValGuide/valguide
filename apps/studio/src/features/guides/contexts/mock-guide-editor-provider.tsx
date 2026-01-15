import type { GuideWithStopsAndAssets, StopWithAssets } from '@valguide/core/features/guides/types'
import { type ReactNode, useState } from 'react'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

type ContentLocale = string

export function MockGuideEditorProvider({
  children,
  initialGuide,
}: {
  children: ReactNode
  initialGuide: GuideWithStopsAndAssets
}) {
  const [guide, setGuide] = useState(initialGuide)
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(initialGuide.availableLocales?.[0] ?? 'en')
  const [selectedStop, setSelectedStop] = useState<StopWithAssets | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const value: GuideEditorContextValue = {
    guide,
    activeLocale,
    selectedStop,
    isDirty,
    isSaving: false,
    updateGuideAvailableLocales: async (locales) => {
      console.log('Mock: updateGuideAvailableLocales', locales)
      setGuide((prev) => ({ ...prev, availableLocales: locales }))
    },
    attachAssetToGuide: async (asset, role) => {
      console.log('Mock: attachAssetToGuide', asset.id, role)
    },
    detachAssetFromGuide: async (assetId, guideAssetId) => {
      console.log('Mock: detachAssetFromGuide', assetId, guideAssetId)
    },
    selectStop: (stop) => {
      setSelectedStop(stop)
    },
    addStop: async () => {
      console.log('Mock: addStop')
      return null
    },
    deleteStop: async (stopId) => {
      console.log('Mock: deleteStop', stopId)
    },
    reorderStops: async (stops) => {
      console.log('Mock: reorderStops', stops.length)
    },
    attachAssetToStop: async (stopId, asset, role, locale) => {
      console.log('Mock: attachAssetToStop', stopId, asset.id, role, locale)
    },
    detachAssetFromStop: async (stopId, assetId, stopAssetId) => {
      console.log('Mock: detachAssetFromStop', stopId, assetId, stopAssetId)
    },
    setActiveLocale: (locale) => {
      setActiveLocale(locale)
    },
    save: async () => {
      console.log('Mock: save')
      setIsDirty(false)
    },
    publish: async () => {
      console.log('Mock: publish')
    },
    refetch: async () => {
      console.log('Mock: refetch')
    },
    registerFormDirty: (_formId, formIsDirty) => {
      setIsDirty(formIsDirty)
    },
    unregisterForm: (_formId) => {},
    resetAllForms: () => {
      setIsDirty(false)
    },
    registerFormReset: (_formId, _resetFn, _saveResetFn) => {},
    lastSaved: null,
  }

  return <GuideEditorContext.Provider value={value}>{children}</GuideEditorContext.Provider>
}
