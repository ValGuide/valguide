import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { createGuideFn, getGuidesFn } from '../server-functions'

interface CreateGuideData {
  translations: Array<{ locale: string; title: string; description?: string }>
  organizationId?: string
}

interface UseGuidesReturn {
  guides: GuideWithTranslations[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGuide: (data: CreateGuideData) => Promise<GuideWithTranslations>
}

async function fetchGuides(): Promise<GuideWithTranslations[]> {
  return await getGuidesFn({ data: {} })
}

export function useGuides(teamSlug?: string): UseGuidesReturn {
  const queryClient = useQueryClient()
  const queryKey = teamSlug ? ['guides', teamSlug] : ['guides']

  const { data, error, isLoading, refetch } = useQuery<GuideWithTranslations[]>({
    queryKey,
    queryFn: fetchGuides,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })

  const createGuide = async (guideData: CreateGuideData): Promise<GuideWithTranslations> => {
    try {
      const createdGuide = await createGuideFn({ data: guideData })
      await queryClient.invalidateQueries({ queryKey: ['guides'] })
      return createdGuide
    } catch (err) {
      console.error('Error creating guide:', err)
      throw err
    }
  }

  const refetchGuides = async () => {
    await refetch()
  }

  return {
    guides: data ?? [],
    isLoading,
    error: error ?? null,
    refetch: refetchGuides,
    createGuide,
  }
}
