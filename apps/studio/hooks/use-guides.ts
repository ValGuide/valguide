import { useEffect, useState } from 'react'
import { Guide } from '@valguide/features/guides/types'

interface UseGuidesReturn {
  guides: Guide[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
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

  useEffect(() => {
    fetchGuides()
  }, [])

  return {
    guides,
    isLoading,
    error,
    refetch: fetchGuides,
  }
}

