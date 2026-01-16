import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import type { GuideListItem } from '@valguide/core/features/guides/types'
import { useLocale } from '@valguide/core/i18n/client'
import { guidesListQueryOptions } from '../query-options'
import { createGuideFn } from '../server-functions'

interface CreateGuideData {
  translations: Array<{ locale: string; title: string; description?: string }>
  organizationId?: string
}

interface UseGuidesReturn {
  guides: GuideListItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGuide: (data: CreateGuideData) => Promise<GuideWithTranslations>
}

export function useGuides(): UseGuidesReturn {
  const queryClient = useQueryClient()
  const locale = useLocale()

  const { data, error, isLoading, refetch } = useQuery(guidesListQueryOptions(locale))

  const createGuide = async (guideData: CreateGuideData): Promise<GuideWithTranslations> => {
    try {
      const createdGuide = await createGuideFn({ data: guideData })
      await queryClient.invalidateQueries({ queryKey: ['guides-list'] })
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
