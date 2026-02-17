import type { StructureDraftStop } from '@valguide/core/features/tours/structure/get-structure-draft.fn'
import { createContext, useContext } from 'react'

export interface TourEditorStopsContextValue {
  stops: StructureDraftStop[]
  isLoadingStops: boolean
  stopsError: Error | null
  addStop: () => Promise<StructureDraftStop | null>
  removeStop: (stopNanoId: string) => Promise<void>
  reorderStops: (stopNanoIds: string[]) => Promise<void>
  refetchStops: () => Promise<void>
}

export const TourEditorStopsContext = createContext<TourEditorStopsContextValue | null>(null)

export function useTourEditorStops() {
  const context = useContext(TourEditorStopsContext)
  if (!context) {
    throw new Error('useTourEditorStops must be used within TourEditorStopsProvider')
  }
  return context
}
