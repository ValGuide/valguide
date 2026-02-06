import { checkTourSlugAvailableFn } from '@valguide/core/features/tours/tour/slug/check-tour-slug-available.fn'
import { getTourSlugsFn } from '@valguide/core/features/tours/tour/slug/get-tour-slugs.fn'
import { updateTourSlugFn } from '@valguide/core/features/tours/tour/slug/update-tour-slug.fn'
import { useEffect, useState } from 'react'
import { type TourSlugHistoryItem, TourSlugSettings } from './tour-slug-settings'

interface TourSlugSettingsConnectedProps {
  tourNanoId: string
  tourTitle: string
}

export function TourSlugSettingsConnected({ tourNanoId, tourTitle }: TourSlugSettingsConnectedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [slugHistory, setSlugHistory] = useState<TourSlugHistoryItem[]>([])

  useEffect(() => {
    async function loadSlugs() {
      try {
        const slugs = await getTourSlugsFn({
          data: { tourNanoId },
        })
        setSlugHistory(slugs)
      } catch (error) {
        console.error('Failed to load tour slugs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSlugs()
  }, [tourNanoId])

  const handleUpdateSlug = async (newSlug: string) => {
    const result = await updateTourSlugFn({
      data: { tourNanoId, newSlug },
    })

    if (result.success) {
      const updatedSlugs = await getTourSlugsFn({
        data: { tourNanoId },
      })
      setSlugHistory(updatedSlugs)
    }

    return result
  }

  const handleCheckSlugAvailable = async (slug: string) => {
    return checkTourSlugAvailableFn({
      data: { slug, tourNanoId },
    })
  }

  const primarySlug = slugHistory.find((s) => s.isPrimary)

  return (
    <TourSlugSettings
      tourTitle={tourTitle}
      initialSlug={primarySlug?.slug}
      slugHistory={slugHistory}
      isLoading={isLoading}
      onUpdateSlug={handleUpdateSlug}
      onCheckSlugAvailable={handleCheckSlugAvailable}
    />
  )
}
