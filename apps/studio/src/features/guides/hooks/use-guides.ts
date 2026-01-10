import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { guidesQueryOptions } from '../query-options'
import { createGuideFn } from '../server-functions'

interface CreateGuideData {
  translations: Array<{ locale: string; title: string; description?: string }>
  organizationId?: string
}

interface UseGuidesReturn {
  guides: GuideWithTranslationsAndCover[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGuide: (data: CreateGuideData) => Promise<GuideWithTranslations>
}

export function useGuides(_teamSlug?: string): UseGuidesReturn {
  const queryClient = useQueryClient()

  const { data, error, isLoading, refetch } = useQuery(guidesQueryOptions())

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
