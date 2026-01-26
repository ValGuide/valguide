import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type CreateGuideInput,
  type CreateGuideResult,
  createGuideFn,
} from '@valguide/core/features/guides/guide/create-guide'
import type { GuideListItem } from '@valguide/core/features/guides/guide/list-guides'
import { useLocale } from '@valguide/core/i18n/client'
import { guidesListQueryOptions } from '../query-options'

interface UseGuidesReturn {
  guides: GuideListItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGuide: (data: CreateGuideInput) => Promise<CreateGuideResult>
}

export function useGuides(): UseGuidesReturn {
  const queryClient = useQueryClient()
  const locale = useLocale()

  const { data, error, isLoading, refetch } = useQuery(guidesListQueryOptions(locale))

  const createGuide = async (guideData: CreateGuideInput): Promise<CreateGuideResult> => {
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
