import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTourInput, CreateTourResult } from '@valguide/core/features/tours/tour/create-tour.fn'
import { createTourFn } from '@valguide/core/features/tours/tour/create-tour.fn'
import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { useLocale } from '@valguide/core/i18n/client'
import { toursListQueryOptions } from '../query-options'

interface UseToursReturn {
  tours: TourListItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createTour: (data: CreateTourInput) => Promise<CreateTourResult>
}

export function useTours(): UseToursReturn {
  const queryClient = useQueryClient()
  const locale = useLocale()

  const { data, error, isLoading, refetch } = useQuery(toursListQueryOptions(locale))

  const createTour = async (tourData: CreateTourInput): Promise<CreateTourResult> => {
    try {
      const createdTour = await createTourFn({ data: tourData })
      await queryClient.invalidateQueries({ queryKey: ['tours'] })
      return createdTour
    } catch (err) {
      console.error('Error creating tour:', err)
      throw err
    }
  }

  const refetchTours = async () => {
    await refetch()
  }

  return {
    tours: data ?? [],
    isLoading,
    error: error ?? null,
    refetch: refetchTours,
    createTour,
  }
}
