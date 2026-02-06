import { checkOrgSlugAvailableFn } from '@valguide/core/features/orgs/check-org-slug-available.fn'
import { getOrgSlugsFn } from '@valguide/core/features/orgs/get-org-slugs.fn'
import { updateOrgSlugFn } from '@valguide/core/features/orgs/update-org-slug.fn'
import { useEffect, useState } from 'react'
import { type SlugHistoryItem, TeamSettings } from './team-settings'

interface TeamSettingsConnectedProps {
  team: { id: string; name: string }
}

export function TeamSettingsConnected({ team }: TeamSettingsConnectedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [slugHistory, setSlugHistory] = useState<SlugHistoryItem[]>([])

  useEffect(() => {
    async function loadSlugs() {
      try {
        const slugs = await getOrgSlugsFn({
          data: { organizationId: team.id },
        })
        setSlugHistory(slugs)
      } catch (error) {
        console.error('Failed to load org slugs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSlugs()
  }, [team.id])

  const handleUpdateSlug = async (newSlug: string) => {
    const result = await updateOrgSlugFn({
      data: { organizationId: team.id, newSlug },
    })

    if (result.success) {
      const updatedSlugs = await getOrgSlugsFn({
        data: { organizationId: team.id },
      })
      setSlugHistory(updatedSlugs)
    }

    return result
  }

  const handleCheckSlugAvailable = async (slug: string) => {
    return checkOrgSlugAvailableFn({
      data: { slug, excludeOrgId: team.id },
    })
  }

  const primarySlug = slugHistory.find((s) => s.isPrimary)

  return (
    <TeamSettings
      team={team}
      initialSlug={primarySlug?.slug}
      slugHistory={slugHistory}
      isLoading={isLoading}
      onUpdateSlug={handleUpdateSlug}
      onCheckSlugAvailable={handleCheckSlugAvailable}
    />
  )
}
