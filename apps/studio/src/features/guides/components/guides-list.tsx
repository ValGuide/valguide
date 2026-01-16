import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import type { GuideListItem } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import * as React from 'react'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { GuidesListContent } from './guides-list-content'
import { GuidesListEmpty } from './guides-list-empty'
import { GuidesListError } from './guides-list-error'
import { GuidesListLoading } from './guides-list-loading'

interface GuidesListProps {
  guides?: GuideListItem[]
  isLoading?: boolean
  error?: Error | null
  onCreateGuide?: (data: {
    translations: Array<{ locale: string; title: string; description?: string }>
    organizationId?: string
    coverImage?: string
  }) => Promise<GuideWithTranslations>
  onViewGuide?: (guide: GuideListItem) => void
  onNavigateToGuide?: (nanoId: string) => void
  onRetry?: () => void
}

export function GuidesList({
  guides = [],
  isLoading = false,
  error = null,
  onCreateGuide,
  onViewGuide,
  onNavigateToGuide,
  onRetry,
}: GuidesListProps) {
  const t = useTranslations('guides')
  const [isCreating, setIsCreating] = React.useState(false)

  const handleCreateGuide = React.useCallback(async () => {
    if (!onCreateGuide) {
      console.error('onCreateGuide handler not provided')
      return
    }

    try {
      setIsCreating(true)

      // Create a new guide with default translations in all supported languages
      const newGuide = await onCreateGuide({
        translations: [
          {
            locale: 'en',
            title: 'New Guide',
            description: 'Start creating your guide content',
          },
          {
            locale: 'de',
            title: 'Neuer Guide',
            description: 'Beginnen Sie mit der Erstellung Ihres Guide-Inhalts',
          },
          {
            locale: 'rm',
            title: 'Nova Guida',
            description: 'Cumenzai a crear il cuntegn da tia guida',
          },
        ],
      })

      toast.success(t('create.success'), {
        description: t('create.successDescription'),
      })

      // Navigate to guide editor if handler provided
      if (onNavigateToGuide && newGuide?.nanoId) {
        onNavigateToGuide(newGuide.nanoId)
      }
    } catch (err) {
      console.error('Failed to create guide:', err)
      toast.error(t('create.error'), {
        description: err instanceof Error ? err.message : t('create.errorDescription'),
      })
    } finally {
      setIsCreating(false)
    }
  }, [onCreateGuide, onNavigateToGuide])

  if (isLoading) {
    return <GuidesListLoading />
  }

  if (error) {
    return <GuidesListError error={error} onRetry={onRetry} />
  }

  if (guides.length === 0) {
    return <GuidesListEmpty isCreating={isCreating} onCreateGuide={handleCreateGuide} />
  }

  return (
    <GuidesListContent
      guides={guides}
      isCreating={isCreating}
      onCreateGuide={handleCreateGuide}
      onViewGuide={onViewGuide}
    />
  )
}
