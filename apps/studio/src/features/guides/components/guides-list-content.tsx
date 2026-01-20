import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'
import type { Guide, GuideListItem } from '@valguide/core/features/guides/types'

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
  onViewGuide?: (guide: GuideListItem) => void
}

export function GuidesListContent({ guides, onViewGuide }: GuidesListContentProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <GuidePreviewCard key={guide.id} guide={toGuideForPreview(guide)} onViewDetails={() => onViewGuide?.(guide)} />
      ))}
    </div>
  )
}
