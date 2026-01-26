import { Image } from '@unpic/react'
import { RichTextDisplay } from '@valguide/core/features/guides/components/rich-text-display'
import type { AssetWithRole } from '@valguide/core/features/guides/queries'
import { PageTitle } from '@valguide/ui/components/page-title'
import { ImageGallery } from './image-gallery'

type GuideHeroProps = {
  title: string
  description: string | null
  coverImage: string | null
  assets: AssetWithRole[]
}

export function GuideHero({ title, description, coverImage, assets }: GuideHeroProps) {
  const galleryImages = assets.filter((a) => a.role === 'gallery' && a.type === 'image')

  return (
    <div className="space-y-6">
      {coverImage && (
        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
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
