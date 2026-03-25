import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStopFn } from '@valguide/core/features/tours/stop/create-stop.fn'
import { addStopToTourFn } from '@valguide/core/features/tours/structure/add-stop.fn'
import { removeStopFromTourFn } from '@valguide/core/features/tours/structure/remove-stop.fn'
import { reorderStopsFn } from '@valguide/core/features/tours/structure/reorder-stops.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { type ReactNode, useCallback } from 'react'
import { useEnableAfterMount } from '@/features/editor/hooks/use-enable-after-mount'
import { tourStructureDraftQueryOptions } from '../query-options'
import { TourEditorStopsContext, type TourEditorStopsContextValue } from './tour-editor-stops-types'
import { useTourEditor } from './tour-editor-types'

interface TourEditorStopsProviderProps {
  children: ReactNode
}

export function TourEditorStopsProvider({ children }: TourEditorStopsProviderProps) {
  const { nanoId, activeLocale } = useTourEditor()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const stopsQueryEnabled = useEnableAfterMount()

  const structureQuery = useQuery({
    ...tourStructureDraftQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId && stopsQueryEnabled,
  })
  const stops = structureQuery.data?.stops ?? []
  const isLoadingStops = !stopsQueryEnabled || structureQuery.isLoading
  const stopsError = structureQuery.error instanceof Error ? structureQuery.error : null

  const addStopMutation = useMutation({
    mutationFn: async () => {
      if (!nanoId) {
        return null
      }

      const newStop = await createStopFn({ data: { locale: activeLocale } })
      await addStopToTourFn({ data: { tourNanoId: nanoId, stopNanoId: newStop.nanoId } })
      await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'structure'], refetchType: 'none' })

      return newStop.nanoId
    },
  })

  const addStop = useCallback(async () => {
    try {
      return await addStopMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to add stop:', error)
      toast.error(t('stops.actions.addError'))
      return null
    }
  }, [addStopMutation, t])

  const removeStop = useCallback(
    async (stopNanoId: string) => {
      if (!nanoId) return
      try {
        await removeStopFromTourFn({ data: { tourNanoId: nanoId, stopNanoId } })
        await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'structure'] })
        toast.success(t('stops.actions.removeSuccess'))
      } catch (error) {
        console.error('Failed to remove stop:', error)
        toast.error(t('stops.actions.removeError'))
      }
    },
    [nanoId, queryClient, t],
  )

  const reorderStops = useCallback(
    async (stopOrder: string[]) => {
      if (!nanoId) return
      try {
        await reorderStopsFn({ data: { tourNanoId: nanoId, stopNanoIds: stopOrder } })
        await queryClient.invalidateQueries({ queryKey: ['tour', nanoId, 'structure'] })
      } catch (error) {
        console.error('Failed to reorder stops:', error)
        toast.error(t('stops.actions.reorderError'))
      }
    },
    [nanoId, queryClient, t],
  )

  const refetchStops = useCallback(async () => {
    await structureQuery.refetch()
  }, [structureQuery])

  const value: TourEditorStopsContextValue = {
    stops,
    isLoadingStops,
    stopsError,
    isAddingStop: addStopMutation.isPending,
    addStop,
    removeStop,
    reorderStops,
    refetchStops,
  }

  return <TourEditorStopsContext.Provider value={value}>{children}</TourEditorStopsContext.Provider>
}
