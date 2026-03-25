import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  createTour: (data?: CreateTourInput) => Promise<CreateTourResult>
  isCreatingTour: boolean
  createTourError: Error | null
}

export function useTours(): UseToursReturn {
  const queryClient = useQueryClient()
  const locale = useLocale()

  const { data, error, isLoading, refetch } = useQuery(toursListQueryOptions(locale))

  const createTourMutation = useMutation({
    mutationFn: async (tourData?: CreateTourInput) => createTourFn({ data: { locale, ...tourData } }),
    onSuccess: async (createdTour, variables) => {
      const queryOptions = toursListQueryOptions(locale)
      const createdAt = new Date()

      queryClient.setQueryData<TourListItem[]>(queryOptions.queryKey, (currentTours) => {
        const tours = currentTours ?? []
        if (tours.some((tour) => tour.nanoId === createdTour.nanoId)) {
          return tours
        }

        return [
          {
            nanoId: createdTour.nanoId,
            title: variables?.title ?? null,
            locale: createdTour.locale,
            availableLocales: [createdTour.locale],
            archivedAt: null,
            publishedAt: null,
            createdAt,
            updatedAt: createdAt,
            coverImage: null,
          },
          ...tours,
        ]
      })

      await queryClient.invalidateQueries({ queryKey: ['tours'], refetchType: 'none' })
    },
  })

  const createTour = async (tourData?: CreateTourInput): Promise<CreateTourResult> => {
    try {
      return await createTourMutation.mutateAsync(tourData)
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
    isCreatingTour: createTourMutation.isPending,
    createTourError: createTourMutation.error instanceof Error ? createTourMutation.error : null,
  }
}
