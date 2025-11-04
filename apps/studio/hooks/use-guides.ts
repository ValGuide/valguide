import { useEffect, useState } from 'react'
import { Guide } from '@valguide/features/guides/types'

interface CreateGuideData {
  translations: Array<{ locale: string; title: string; description?: string }>
  organizationId?: string
  coverImage?: string
}

interface UseGuidesReturn {
  guides: Guide[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGuide: (data: CreateGuideData) => Promise<Guide>
}

export function useGuides(): UseGuidesReturn {
  const [guides, setGuides] = useState<Guide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGuides = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/guides', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        throw new Error('You must be logged in to view guides')
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch guides: ${response.statusText}`)
      }

      const data = await response.json()

      // Parse dates from ISO strings
      const parsedGuides = data.map((guide: any) => ({
        ...guide,
        createdAt: guide.createdAt ? new Date(guide.createdAt) : undefined,
        updatedAt: guide.updatedAt ? new Date(guide.updatedAt) : undefined,
      }))

      setGuides(parsedGuides)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('Error fetching guides:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createGuideHandler = async (data: CreateGuideData): Promise<Guide> => {
    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.status === 401) {
        throw new Error('You must be logged in to create guides')
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create guide: ${response.statusText}`)
      }

      const newGuide = await response.json()

      // Parse dates from ISO strings
      const parsedGuide = {
        ...newGuide,
        createdAt: newGuide.createdAt ? new Date(newGuide.createdAt) : undefined,
        updatedAt: newGuide.updatedAt ? new Date(newGuide.updatedAt) : undefined,
      }

      // Add to local state
      setGuides((prev) => [parsedGuide, ...prev])

      return parsedGuide
    } catch (err) {
      console.error('Error creating guide:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  return {
    guides,
    isLoading,
    error,
    refetch: fetchGuides,
    createGuide: createGuideHandler,
  }
}

