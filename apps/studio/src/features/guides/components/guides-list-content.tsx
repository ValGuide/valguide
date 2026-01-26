import type { GuideListItem } from '@valguide/core/features/guides/guide/list-guides'
import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'
import type { Guide } from '@valguide/core/features/guides/types'

function toGuideForPreview(guide: GuideListItem): Guide {
  return {
    id: guide.nanoId,
    nanoId: guide.nanoId,
    title: guide.title ?? undefined,
    description: undefined,
    imageUrl: undefined,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    published: null,
  }
}

interface GuidesListContentProps {
  guides: GuideListItem[]
  onViewGuide?: (guide: GuideListItem) => void
}

export function GuidesListContent({ guides, onViewGuide }: GuidesListContentProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <GuidePreviewCard
          key={guide.nanoId}
          guide={toGuideForPreview(guide)}
          onViewDetails={() => onViewGuide?.(guide)}
        />
      ))}
    </div>
  )
}
