import type { Asset } from '@valguide/core/features/assets/schema'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft.fn'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { type ReactNode, useCallback, useState } from 'react'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

export interface MockGuideEditorProviderProps {
  children: ReactNode
  guideDetail: GuideDetail
  localeDraft?: GuideLocaleDraftResult | null
  stops?: StructureDraftStop[]
}

export function MockGuideEditorProvider({
  children,
  guideDetail,
  localeDraft = null,
  stops: initialStops = [],
}: MockGuideEditorProviderProps) {
  const [activeLocale, setActiveLocale] = useState<string>(guideDetail.availableLocales[0] ?? 'en')
  const [isDirty, setIsDirty] = useState(false)
  const [guideAssets, setGuideAssets] = useState<AssetWithRole[]>([])
  const [stopAssetsMap, setStopAssetsMap] = useState<Map<string, AssetWithRole[]>>(new Map())
  const [stops, setStops] = useState<StructureDraftStop[]>(initialStops)

  const getStopAssets = useCallback(
    (stopNanoId: string): AssetWithRole[] => {
      return stopAssetsMap.get(stopNanoId) ?? []
    },
    [stopAssetsMap],
  )

  const value: GuideEditorContextValue = {
    nanoId: guideDetail.nanoId,
    guideId: guideDetail.id,
    activeLocale,
    availableLocales: guideDetail.availableLocales,
    setActiveLocale,
    updateAvailableLocales: async (locales: string[]) => {
      console.log('Mock: updateAvailableLocales', locales)
    },
    guideDetail,
    localeDraft,
    isLoadingLocale: false,
    stops,
    addStop: async () => {
      console.log('Mock: addStop')
      return null
    },
    removeStop: async (stopNanoId: string) => {
      console.log('Mock: removeStop', stopNanoId)
      setStops((prev) => prev.filter((s) => s.stopNanoId !== stopNanoId))
    },
    reorderStops: async (stopNanoIds: string[]) => {
      console.log('Mock: reorderStops', stopNanoIds)
      setStops((prev) => {
        const byNanoId = new Map(prev.map((s) => [s.stopNanoId, s]))
        return stopNanoIds.map((id, index) => ({ ...byNanoId.get(id)!, position: index }))
      })
    },
    guideAssets,
    getStopAssets,
    setGuideCover: (asset: Asset | null) => {
      console.log('Mock: setGuideCover', asset?.id)
      if (asset) {
        setGuideAssets([{ ...asset, role: 'cover', order: 0, locale: null }])
      } else {
        setGuideAssets([])
      }
      setIsDirty(true)
    },
    updateStopAssets: (stopNanoId: string, assets: AssetWithRole[]) => {
      console.log('Mock: updateStopAssets', stopNanoId, assets.length)
      setStopAssetsMap((prev) => new Map(prev).set(stopNanoId, assets))
      setIsDirty(true)
    },
    addStopAsset: (stopNanoId: string, asset: Asset, role: string, locale: string | null) => {
      console.log('Mock: addStopAsset', stopNanoId, asset.id, role, locale)
      const current = stopAssetsMap.get(stopNanoId) ?? []
      setStopAssetsMap((prev) =>
        new Map(prev).set(stopNanoId, [...current, { ...asset, role, order: current.length, locale }]),
      )
      setIsDirty(true)
    },
    removeStopAsset: (stopNanoId: string, assetId: string) => {
      console.log('Mock: removeStopAsset', stopNanoId, assetId)
      const current = stopAssetsMap.get(stopNanoId) ?? []
      setStopAssetsMap((prev) =>
        new Map(prev).set(
          stopNanoId,
          current.filter((a) => a.id !== assetId),
        ),
      )
      setIsDirty(true)
    },
    isDirty,
    registerFormDirty: (_formId: string, formIsDirty: boolean) => {
      setIsDirty(formIsDirty)
    },
    unregisterForm: (_formId: string) => {},
    registerFormReset: (_formId: string, _resetFn: () => void) => {},
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
