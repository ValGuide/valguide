'use client'

import type { Guide } from '@valguide/features/guides/types'
import useSWR from 'swr'
import { fetchGuides } from '../api/fetchers'

interface CreateGuideData {
  translations: Array<{ locale: string; title: string; description?: string }>
  organizationId?: string
}

interface UseGuidesReturn {
  guides: Guide[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGuide: (data: CreateGuideData) => Promise<Guide>
}

export function useGuides(teamSlug?: string): UseGuidesReturn {
  const key = teamSlug ? ['/api/guides', teamSlug] : '/api/guides'
  const { data, error, isLoading, mutate } = useSWR<Guide[]>(key, () => fetchGuides(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true, // Key for instant navigation!
  })

  const createGuide = async (guideData: CreateGuideData): Promise<Guide> => {
    const now = new Date()
    const tempId = `temp-${Date.now()}`
    const tempGuide: Guide = {
      id: tempId,
      nanoId: tempId,
      translations: guideData.translations.map((t) => ({
        id: `temp-translation-${Date.now()}-${t.locale}`,
        title: t.title,
        description: t.description || null,
        locale: t.locale,
        guideId: tempId,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    }

    try {
      // Optimistic update with mutate
      const newGuide = await mutate(
        async (current) => {
          const response = await fetch('/api/guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guideData),
          })

          if (response.status === 401) {
            throw new Error('You must be logged in to create guides')
          }

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to create guide: ${response.statusText}`)
          }

          const createdGuide = await response.json()

          // Parse dates from ISO strings
          const parsedGuide = {
            ...createdGuide,
            createdAt: createdGuide.createdAt ? new Date(createdGuide.createdAt) : undefined,
            updatedAt: createdGuide.updatedAt ? new Date(createdGuide.updatedAt) : undefined,
          }

          return [parsedGuide, ...(current || [])]
        },
        {
          optimisticData: [tempGuide, ...(data || [])],
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        },
      )

      return newGuide?.[0] || tempGuide
    } catch (err) {
      console.error('Error creating guide:', err)
      throw err
    }
  }

  const refetchGuides = async () => {
    await mutate()
  }

  return {
    guides: data || [],
    isLoading,
    error: error || null,
    refetch: refetchGuides,
    createGuide,
  }
}
