import { createStopFn } from '@valguide/core/features/tours/stop/create-stop.fn'
import { addStopToTourFn } from '@valguide/core/features/tours/structure/add-stop.fn'
import { removeStopFromTourFn } from '@valguide/core/features/tours/structure/remove-stop.fn'
import { reorderStopsFn } from '@valguide/core/features/tours/structure/reorder-stops.fn'
import { assignTourAssetFn } from '@valguide/core/features/tours/tour/asset/assign-tour-asset.fn'
import { removeTourAssetFn } from '@valguide/core/features/tours/tour/asset/remove-tour-asset.fn'
import { updateTourLocaleDraftFn } from '@valguide/core/features/tours/tour/locale/update-tour-locale-draft.fn'
import { publishTourFn } from '@valguide/core/features/tours/tour/publish-tour.fn'
import { updateTourFn } from '@valguide/core/features/tours/tour/update-tour.fn'
import { type ReactNode, useMemo } from 'react'
import { TourEditorProvider } from './tour-editor-context'

interface TourEditorConnectedProviderProps {
  children: ReactNode
  nanoId: string
  initialLocale?: string
  navigation?: {
    backPath: string
    backLabel: string
  }
}

export function TourEditorConnectedProvider({
  children,
  nanoId,
  initialLocale,
  navigation,
}: TourEditorConnectedProviderProps) {
  const actions = useMemo(
    () => ({
      updateAvailableLocales: async ({ nanoId, locales }: { nanoId: string; locales: string[] }) =>
        updateTourFn({ data: { nanoId, availableLocales: locales } }),
      removeTourAsset: async (input: { nanoId: string; assetId: string; channel: string; locale: string | null }) =>
        removeTourAssetFn({ data: input }),
      assignTourAsset: async (input: {
        nanoId: string
        assetId: string
        channel: string
        locale: string | null
        position: number
      }) => assignTourAssetFn({ data: input }),
      updateTourLocaleDraft: async (input: { nanoId: string; locale: string; title: string; description: string }) =>
        updateTourLocaleDraftFn({ data: input }),
      publishTour: async ({ nanoId, locale }: { nanoId: string; locale: string }) =>
        publishTourFn({ data: { nanoId, locale } }),
    }),
    [],
  )

  const stopsActions = useMemo(
    () => ({
      createStop: async ({ locale }: { locale: string }) => createStopFn({ data: { locale } }),
      addStopToTour: async ({ tourNanoId, stopNanoId }: { tourNanoId: string; stopNanoId: string }) =>
        addStopToTourFn({ data: { tourNanoId, stopNanoId } }),
      removeStopFromTour: async ({ tourNanoId, stopNanoId }: { tourNanoId: string; stopNanoId: string }) =>
        removeStopFromTourFn({ data: { tourNanoId, stopNanoId } }),
      reorderStops: async ({ tourNanoId, stopNanoIds }: { tourNanoId: string; stopNanoIds: string[] }) =>
        reorderStopsFn({ data: { tourNanoId, stopNanoIds } }),
    }),
    [],
  )

  return (
    <TourEditorProvider
      nanoId={nanoId}
      initialLocale={initialLocale}
      navigation={navigation}
      actions={actions}
      stopsActions={stopsActions}
    >
      {children}
    </TourEditorProvider>
  )
}
