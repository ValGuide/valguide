import type { Asset } from '@valguide/core/features/assets/schema'
import type { StopAssetDraftItem } from '@valguide/core/features/tours/stop/asset/get-stop-assets-draft.fn'
import type { StopDetail } from '@valguide/core/features/tours/stop/get-stop-detail.fn'
import type { StopLocaleDraftResult } from '@valguide/core/features/tours/stop/locale/get-stop-locale-draft.fn'
import type { StopLocalePublishedResult } from '@valguide/core/features/tours/stop/locale/get-stop-locale-published.fn'
import { type ReactNode, useState } from 'react'
import { StopEditorContext, type StopEditorContextValue, type StopEditorNavigation } from './stop-editor-types'

export interface MockStopEditorProviderProps {
  children: ReactNode
  stopDetail: StopDetail
  localeDraft?: StopLocaleDraftResult | null
  localePublished?: StopLocalePublishedResult | null
  assets?: StopAssetDraftItem[]
  navigation?: StopEditorNavigation
}

export function MockStopEditorProvider({
  children,
  stopDetail,
  localeDraft = null,
  localePublished = null,
  assets: initialAssets = [],
  navigation = { backPath: '/stops', backLabel: 'All Stops' },
}: MockStopEditorProviderProps) {
  const [activeLocale, setActiveLocale] = useState<string>(stopDetail.availableLocales[0] ?? 'en')
  const [isDirty, setIsDirty] = useState(false)
  const [assets, setAssets] = useState<StopAssetDraftItem[]>(initialAssets)

  const value: StopEditorContextValue = {
    nanoId: stopDetail.nanoId,
    stopId: stopDetail.id,
    navigation,
    activeLocale,
    availableLocales: stopDetail.availableLocales,
    existingLocales: stopDetail.existingLocales,
    setActiveLocale,
    updateAvailableLocales: async (locales: string[]) => {
      console.log('Mock: updateAvailableLocales', locales)
    },
    stopDetail,
    localeDraft,
    isLoadingLocale: false,
    localePublished,
    isLoadingLocalePublished: false,
    assets,
    isLoadingAssets: false,
    assetsPublished: [],
    isLoadingAssetsPublished: false,
    updateAssets: async (newAssets: StopAssetDraftItem[]) => {
      console.log('Mock: updateAssets', newAssets.length)
      setAssets(newAssets)
      setIsDirty(true)
    },
    addAsset: async (asset: Asset, channel: string, locale: string | null) => {
      console.log('Mock: addAsset', asset.id, channel, locale)
      setAssets((prev) => [
        ...prev,
        { id: `mock-${asset.id}`, asset, channel, position: prev.length, locale, createdAt: new Date() },
      ])
      setIsDirty(true)
    },
    removeAsset: async (assetId: string) => {
      console.log('Mock: removeAsset', assetId)
      setAssets((prev) => prev.filter((a) => a.asset.id !== assetId))
      setIsDirty(true)
    },
    guideUsage: { guideCount: 1, guides: [] },
    isLoadingGuideUsage: false,
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
    publish: async (locale: string) => {
      console.log('Mock: publish', locale)
    },
    unpublish: async (locale: string) => {
      console.log('Mock: unpublish', locale)
    },
    refetch: async () => {
      console.log('Mock: refetch')
    },
  }

  return <StopEditorContext.Provider value={value}>{children}</StopEditorContext.Provider>
}
