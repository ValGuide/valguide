import { type Tour, TourPreviewCard } from '@valguide/core/features/tours/preview-card'
import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'

function toTourForPreview(tour: TourListItem): Tour {
  return {
    id: tour.nanoId,
    nanoId: tour.nanoId,
    title: tour.title ?? undefined,
    description: undefined,
    coverImage: tour.coverImage ?? undefined,
    createdAt: tour.createdAt,
    updatedAt: tour.updatedAt,
    published: null,
  }
}

interface ToursListContentProps {
  tours: TourListItem[]
  onViewTour?: (tour: TourListItem) => void
}

export function ToursListContent({ tours, onViewTour }: ToursListContentProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => (
        <TourPreviewCard key={tour.nanoId} tour={toTourForPreview(tour)} onViewDetails={() => onViewTour?.(tour)} />
      ))}
    </div>
  )
}
