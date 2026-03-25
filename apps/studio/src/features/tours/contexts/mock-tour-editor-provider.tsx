import type { Asset } from '@valguide/core/features/assets/types'
import type { StructureDraftStop } from '@valguide/core/features/tours/structure/get-structure-draft.fn'
import type { TourAssetDraftItem } from '@valguide/core/features/tours/tour/asset/get-tour-assets-draft.fn'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import type { TourLocaleDraftResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-draft.fn'
import type { TourLocalePublishedResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-published.fn'
import { type ReactNode, useState } from 'react'
import { TourEditorStopsContext, type TourEditorStopsContextValue } from './tour-editor-stops-types'
import { TourEditorContext, type TourEditorContextValue } from './tour-editor-types'

export interface MockTourEditorProviderProps {
  children: ReactNode
  tourDetail: TourDetail
  localeDraft?: TourLocaleDraftResult | null
  localePublished?: TourLocalePublishedResult | null
  stops?: StructureDraftStop[]
  tourAssets?: TourAssetDraftItem[]
}

export function MockTourEditorProvider({
  children,
  tourDetail,
  localeDraft = null,
  localePublished = null,
  stops: initialStops = [],
  tourAssets: initialTourAssets = [],
}: MockTourEditorProviderProps) {
  const [activeLocale, setActiveLocale] = useState<string>(tourDetail.availableLocales[0] ?? 'en')
  const [isDirty, setIsDirty] = useState(false)
  const [tourAssets, setTourAssets] = useState<TourAssetDraftItem[]>(initialTourAssets)
  const [stops, setStops] = useState<StructureDraftStop[]>(initialStops)

  const value: TourEditorContextValue = {
    nanoId: tourDetail.nanoId,
    tourId: tourDetail.id,
    navigation: { backPath: `/tours/${tourDetail.nanoId}`, backLabel: 'tours.editor.tourDetails' },
    activeLocale,
    availableLocales: tourDetail.availableLocales,
    setActiveLocale,
    updateAvailableLocales: async (locales: string[]) => {
      console.log('Mock: updateAvailableLocales', locales)
    },
    tourDetail,
    localeDraft,
    isLoadingLocale: false,
    localePublished,
    isLoadingLocalePublished: false,
    tourAssets,
    isLoadingTourAssets: false,
    tourAssetsPublished: [],
    isLoadingTourAssetsPublished: false,
    setTourCover: async (asset: Asset | null) => {
      console.log('Mock: setTourCover', asset?.id)
      if (asset) {
        setTourAssets([
          { id: `mock-${asset.id}`, asset, channel: 'images.hero', position: 0, locale: null, createdAt: new Date() },
        ])
      } else {
        setTourAssets([])
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

  const stopsValue: TourEditorStopsContextValue = {
    stops,
    isLoadingStops: false,
    stopsError: null,
    isAddingStop: false,
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
        return stopNanoIds.flatMap((id, index) => {
          const stop = byNanoId.get(id)
          if (!stop) {
            return []
          }
          return [{ ...stop, position: index }]
        })
      })
    },
    refetchStops: async () => {
      console.log('Mock: refetchStops')
    },
  }

  return (
    <TourEditorContext.Provider value={value}>
      <TourEditorStopsContext.Provider value={stopsValue}>{children}</TourEditorStopsContext.Provider>
    </TourEditorContext.Provider>
  )
}
