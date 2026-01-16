import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'
import type { Guide, GuideListItem } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Plus } from 'lucide-react'

function toGuideForPreview(guide: GuideListItem): Guide {
  return {
    id: guide.id,
    nanoId: guide.nanoId,
    title: guide.displayTitle,
    description: guide.displayDescription ?? undefined,
    imageUrl: guide.coverImageUrl ?? undefined,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    published: guide.published,
  }
}

interface GuidesListContentProps {
  guides: GuideListItem[]
  isCreating?: boolean
  onCreateGuide?: () => void
  onViewGuide?: (guide: GuideListItem) => void
}

export function GuidesListContent({
  guides,
  isCreating = false,
  onCreateGuide,
  onViewGuide,
}: GuidesListContentProps) {
  const t = useTranslations('guides')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={onCreateGuide} disabled={isCreating} className="group">
          <Plus className="transition-transform duration-200 group-hover:rotate-90" />
          {isCreating ? t('empty.creating') : t('empty.createNewButton')}
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuidePreviewCard
            key={guide.id}
            guide={toGuideForPreview(guide)}
            onViewDetails={() => onViewGuide?.(guide)}
          />
        ))}
      </div>
    </div>
  )
}
