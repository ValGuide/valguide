import { getOrgSlugsFn } from '@valguide/core/features/orgs/get-org-slugs.fn'
import { checkTourSlugAvailableFn } from '@valguide/core/features/tours/tour/slug/check-tour-slug-available.fn'
import { getTourSlugsFn } from '@valguide/core/features/tours/tour/slug/get-tour-slugs.fn'
import { upsertTourDraftSlugFn } from '@valguide/core/features/tours/tour/slug/upsert-tour-draft-slug.fn'
import { useEffect, useState } from 'react'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { type TourSlugHistoryItem, TourSlugSettings } from './tour-slug-settings'

interface TourSlugSettingsConnectedProps {
  tourNanoId: string
  tourTitle: string
  variant?: 'card' | 'plain'
}

export function TourSlugSettingsConnected({ tourNanoId, tourTitle, variant }: TourSlugSettingsConnectedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [slugHistory, setSlugHistory] = useState<TourSlugHistoryItem[]>([])
  const [orgSlug, setOrgSlug] = useState<string>()
  const { data: sidebarData } = useSidebarData()

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

  useEffect(() => {
    const teamId = sidebarData?.currentTeam?.id
    if (!teamId) return
    getOrgSlugsFn({ data: { organizationId: teamId } }).then((slugs) => {
      const primary = slugs.find((s) => s.isPrimary)
      if (primary) setOrgSlug(primary.slug)
    })
  }, [sidebarData?.currentTeam?.id])

  const handleUpdateSlug = async (newSlug: string) => {
    const result = await upsertTourDraftSlugFn({
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

  const draftSlug = slugHistory.find((s) => !s.publishedAt)
  const primarySlug = slugHistory.find((s) => s.isPrimary)
  const currentSlug = draftSlug ?? primarySlug

  return (
    <TourSlugSettings
      tourTitle={tourTitle}
      initialSlug={currentSlug?.slug}
      slugHistory={slugHistory}
      isLoading={isLoading}
      variant={variant}
      orgSlug={orgSlug}
      onUpdateSlug={handleUpdateSlug}
      onCheckSlugAvailable={handleCheckSlugAvailable}
    />
  )
}
