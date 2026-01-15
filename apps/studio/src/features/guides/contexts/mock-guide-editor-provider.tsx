import type { GuideLocaleData, GuideMetadata, StopMetadata } from '@valguide/core/features/guides/types'
import { type ReactNode, useState } from 'react'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

type ContentLocale = string

export interface MockGuideEditorProviderProps {
  children: ReactNode
  metadata: GuideMetadata
  localeData?: GuideLocaleData | null
}

export function MockGuideEditorProvider({
  children,
  metadata: initialMetadata,
  localeData: initialLocaleData = null,
}: MockGuideEditorProviderProps) {
  const [metadata, setMetadata] = useState(initialMetadata)
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(initialMetadata.availableLocales[0] ?? 'en')
  const [isDirty, setIsDirty] = useState(false)

  const stops: StopMetadata[] = metadata.stops

  const value: GuideEditorContextValue = {
    nanoId: metadata.nanoId,
    guideId: metadata.id,
    activeLocale,
    availableLocales: metadata.availableLocales,
    setActiveLocale,
    updateAvailableLocales: async (locales: string[]) => {
      console.log('Mock: updateAvailableLocales', locales)
      setMetadata((prev) => ({ ...prev, availableLocales: locales }))
    },
    metadata,
    localeData: initialLocaleData,
    isLoadingLocale: false,
    stops,
    addStop: async () => {
      console.log('Mock: addStop')
      return null
    },
    deleteStop: async (stopId: string) => {
      console.log('Mock: deleteStop', stopId)
    },
    reorderStops: async (stopsData: Array<{ id: string; order: number }>) => {
      console.log('Mock: reorderStops', stopsData.length)
    },
    attachAssetToGuide: async (asset, role) => {
      console.log('Mock: attachAssetToGuide', asset.id, role)
    },
    detachAssetFromGuide: async (assetId, guideAssetId) => {
      console.log('Mock: detachAssetFromGuide', assetId, guideAssetId)
    },
    attachAssetToStop: async (stopId, asset, role, locale) => {
      console.log('Mock: attachAssetToStop', stopId, asset.id, role, locale)
    },
    detachAssetFromStop: async (stopId, assetId, stopAssetId) => {
      console.log('Mock: detachAssetFromStop', stopId, assetId, stopAssetId)
    },
    isDirty,
    registerFormDirty: (_formId, formIsDirty) => {
      setIsDirty(formIsDirty)
    },
    unregisterForm: (_formId) => {},
    registerFormReset: (_formId, _resetFn, _saveResetFn) => {},
    resetAllForms: () => {
      setIsDirty(false)
    },
    save: async () => {
      console.log('Mock: save')
      setIsDirty(false)
    },
    isSaving: false,
    lastSaved: null,
    publish: async () => {
      console.log('Mock: publish')
    },
    refetch: async () => {
      console.log('Mock: refetch')
    },
  }

  return <GuideEditorContext.Provider value={value}>{children}</GuideEditorContext.Provider>
}
