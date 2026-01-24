import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import type { GuideListItem } from '@valguide/core/features/guides/types'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import { GuidesListContent } from './guides-list-content'
import { GuidesListEmpty } from './guides-list-empty'
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
  const locale = useLocale()
  const [isCreating, setIsCreating] = React.useState(false)

  const handleCreateGuide = React.useCallback(async () => {
    if (!onCreateGuide) {
      console.error('onCreateGuide handler not provided')
      return
    }

    try {
      setIsCreating(true)

      // Create a new guide with translation in the current studio language
      const newGuide = await onCreateGuide({
        translations: [
          {
            locale,
            title: null,
            description: null,
          },
        ],
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
  }, [onCreateGuide, onNavigateToGuide, locale, t])

  const renderContent = () => {
    if (isLoading) {
      return <GuidesListLoading />
    }

    if (error) {
      return (
        <ListError
          error={error}
          onRetry={onRetry}
          title={t('error.failedToLoad')}
          fallbackMessage={t('error.unexpected')}
        />
      )
    }

    if (guides.length === 0) {
      return <GuidesListEmpty isCreating={isCreating} onCreateGuide={handleCreateGuide} />
    }

    return <GuidesListContent guides={guides} onViewGuide={onViewGuide} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <ListPageHeader
        title={t('title')}
        description={t('description')}
        action={
          guides.length > 0 && (
            <Button onClick={handleCreateGuide} disabled={isCreating} className="group">
              <Plus className="transition-transform duration-200 group-hover:rotate-90" />
              {isCreating ? t('empty.creating') : t('empty.createNewButton')}
            </Button>
          )
        }
      />
      {renderContent()}
    </div>
  )
}
