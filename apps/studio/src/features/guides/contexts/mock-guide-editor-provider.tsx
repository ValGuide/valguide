import type { Asset } from '@valguide/core/features/assets/schema'
import type { GuideAssetDraftItem } from '@valguide/core/features/guides/guide/asset/get-guide-assets-draft.fn'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import type { GuideLocalePublishedResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-published.fn'
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft.fn'
import { type ReactNode, useState } from 'react'
import { GuideEditorContext, type GuideEditorContextValue } from './guide-editor-types'

export interface MockGuideEditorProviderProps {
  children: ReactNode
  guideDetail: GuideDetail
  localeDraft?: GuideLocaleDraftResult | null
  localePublished?: GuideLocalePublishedResult | null
  stops?: StructureDraftStop[]
}

export function MockGuideEditorProvider({
  children,
  guideDetail,
  localeDraft = null,
  localePublished = null,
  stops: initialStops = [],
}: MockGuideEditorProviderProps) {
  const [activeLocale, setActiveLocale] = useState<string>(guideDetail.availableLocales[0] ?? 'en')
  const [isDirty, setIsDirty] = useState(false)
  const [guideAssets, setGuideAssets] = useState<GuideAssetDraftItem[]>([])
  const [stops, setStops] = useState<StructureDraftStop[]>(initialStops)

  const value: GuideEditorContextValue = {
    nanoId: guideDetail.nanoId,
    guideId: guideDetail.id,
    navigation: { backPath: `/guides/${guideDetail.nanoId}`, backLabel: 'guides.editor.guideDetails' },
    activeLocale,
    availableLocales: guideDetail.availableLocales,
    setActiveLocale,
    updateAvailableLocales: async (locales: string[]) => {
      console.log('Mock: updateAvailableLocales', locales)
    },
    guideDetail,
    localeDraft,
    isLoadingLocale: false,
    localePublished,
    isLoadingLocalePublished: false,
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
    isLoadingGuideAssets: false,
    guideAssetsPublished: [],
    isLoadingGuideAssetsPublished: false,
    setGuideCover: async (asset: Asset | null) => {
      console.log('Mock: setGuideCover', asset?.id)
      if (asset) {
        setGuideAssets([
          { id: `mock-${asset.id}`, asset, channel: 'images.hero', position: 0, locale: null, createdAt: new Date() },
        ])
      } else {
        setGuideAssets([])
      }
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
