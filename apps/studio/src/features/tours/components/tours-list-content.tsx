import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { TourPreviewCard } from '@valguide/core/features/tours/preview-card'
import type { Tour } from '@valguide/core/features/tours/types'

function toTourForPreview(tour: TourListItem): Tour {
  return {
    id: tour.nanoId,
    nanoId: tour.nanoId,
    title: tour.title ?? undefined,
    description: undefined,
    imageUrl: undefined,
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
        <TourPreviewCard
          key={tour.nanoId}
          tour={toTourForPreview(tour)}
          onViewDetails={() => onViewTour?.(tour)}
        />
      ))}
    </div>
  )
}
