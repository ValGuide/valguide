import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import useSWR from 'swr'
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
  const key = teamSlug ? ['guides', teamSlug] : 'guides'
  const { data, error, isLoading, mutate } = useSWR<GuideWithTranslations[]>(key, () => fetchGuides(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })

  const createGuide = async (guideData: CreateGuideData): Promise<GuideWithTranslations> => {
    try {
      const newGuide = await mutate(
        async (current) => {
          const createdGuide = await createGuideFn({
            data: guideData,
          })

          return [createdGuide, ...(current ?? [])]
        },
        {
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        },
      )

      if (!newGuide?.[0]) {
        throw new Error('Failed to create guide')
      }

      return newGuide[0]
    } catch (err) {
      console.error('Error creating guide:', err)
      throw err
    }
  }

  const refetchGuides = async () => {
    await mutate()
  }

  return {
    guides: data ?? [],
    isLoading,
    error: error ?? null,
    refetch: refetchGuides,
    createGuide,
  }
}
