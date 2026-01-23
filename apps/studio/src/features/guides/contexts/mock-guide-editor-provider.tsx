import type { AssetWithRole, GuideLocaleData, GuideMetadata, StopMetadata } from '@valguide/core/features/guides/types'
import { type ReactNode, useCallback, useState } from 'react'
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
  const [guideAssets, setGuideAssets] = useState<AssetWithRole[]>(initialMetadata.assets)
  const [stopAssetsMap, setStopAssetsMap] = useState<Map<string, AssetWithRole[]>>(
    new Map(initialMetadata.stops.map((s) => [s.id, s.assets])),
  )

  const stops: StopMetadata[] = metadata.stops

  const getStopAssets = useCallback(
    (stopId: string): AssetWithRole[] => {
      return stopAssetsMap.get(stopId) ?? []
    },
    [stopAssetsMap],
  )

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
    removeStop: async (stopId: string) => {
      console.log('Mock: removeStop', stopId)
    },
    reorderStops: async (stopsData: Array<{ id: string; order: number }>) => {
      console.log('Mock: reorderStops', stopsData.length)
    },
    guideAssets,
    getStopAssets,
    setGuideCover: (asset) => {
      console.log('Mock: setGuideCover', asset?.id)
      if (asset) {
        setGuideAssets([{ ...asset, role: 'cover', order: 0, locale: null }])
      } else {
        setGuideAssets([])
      }
      setIsDirty(true)
    },
    updateStopAssets: (stopId, assets) => {
      console.log('Mock: updateStopAssets', stopId, assets.length)
      setStopAssetsMap((prev) => new Map(prev).set(stopId, assets))
      setIsDirty(true)
    },
    addStopAsset: (stopId, asset, role, locale) => {
      console.log('Mock: addStopAsset', stopId, asset.id, role, locale)
      const current = stopAssetsMap.get(stopId) ?? []
      setStopAssetsMap((prev) =>
        new Map(prev).set(stopId, [...current, { ...asset, role, order: current.length, locale }]),
      )
      setIsDirty(true)
    },
    removeStopAsset: (stopId, assetId) => {
      console.log('Mock: removeStopAsset', stopId, assetId)
      const current = stopAssetsMap.get(stopId) ?? []
      setStopAssetsMap((prev) =>
        new Map(prev).set(
          stopId,
          current.filter((a) => a.id !== assetId),
        ),
      )
      setIsDirty(true)
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
