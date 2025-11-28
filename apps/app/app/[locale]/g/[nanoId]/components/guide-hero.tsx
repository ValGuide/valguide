'use client'

import type { AssetWithRole } from '@valguide/core/features/guides/queries'
import { RichTextDisplay } from '@valguide/core/features/guides/rich-text-display'
import Image from 'next/image'
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
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        {description && <RichTextDisplay content={description} />}
      </div>

      {galleryImages.length > 0 && <ImageGallery images={galleryImages} />}
    </div>
  )
}
