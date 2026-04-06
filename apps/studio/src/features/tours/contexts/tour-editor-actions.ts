export interface TourEditorActions {
  updateAvailableLocales: (input: { nanoId: string; locales: string[] }) => Promise<unknown>
  removeTourAsset: (input: {
    nanoId: string
    assetId: string
    channel: string
    locale: string | null
  }) => Promise<unknown>
  assignTourAsset: (input: {
    nanoId: string
    assetId: string
    channel: string
    locale: string | null
    position: number
  }) => Promise<unknown>
  updateTourLocaleDraft: (input: {
    nanoId: string
    locale: string
    title: string
    description: string
  }) => Promise<unknown>
  publishTour: (input: { nanoId: string; locale: string }) => Promise<unknown>
}

export interface TourEditorStopsActions {
  createStop: (input: { locale: string }) => Promise<{ nanoId: string }>
  addStopToTour: (input: { tourNanoId: string; stopNanoId: string }) => Promise<unknown>
  removeStopFromTour: (input: { tourNanoId: string; stopNanoId: string }) => Promise<unknown>
  reorderStops: (input: { tourNanoId: string; stopNanoIds: string[] }) => Promise<unknown>
}
