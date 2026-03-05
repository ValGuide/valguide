import type { AssetItem } from '@valguide/core/features/tours/public/types'
import { Image } from '@valguide/ui/components/image'
import { PageTitle } from '@valguide/ui/components/page-title'
import { RichTextDisplay } from '@valguide/ui/components/rich-text/rich-text-display'
import { ImageGallery } from './image-gallery'

type TourHeroProps = {
  title: string
  description: string | null
  coverImage: string | null
  assets: AssetItem[]
}

export function TourHero({ title, description, coverImage, assets }: TourHeroProps) {
  const galleryImages = assets.filter((a) => a.channel === 'images.gallery' && a.type === 'image')

  return (
    <div className="space-y-6">
      {coverImage && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            layout="fullWidth"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div>
        <PageTitle size="xl" className="mb-4">
          {title}
        </PageTitle>
        {description && <RichTextDisplay content={description} />}
      </div>

      {galleryImages.length > 0 && <ImageGallery images={galleryImages} />}
    </div>
  )
}
