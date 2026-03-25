import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { AssetItem } from '@valguide/core/features/tours/public/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { RevealImage } from '@valguide/ui/components/reveal-image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type ImageGalleryProps = {
  images: AssetItem[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const t = useTranslations('tour')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  const currentImage = images[currentIndex]
  if (!currentImage) return null

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-muted">
        <RevealImage
          src={getAssetImageUrl(currentImage)}
          alt={currentImage.fileName}
          layout="fullWidth"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              {t('imageCounter', { current: currentIndex + 1, total: images.length })}
            </span>

            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1}
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                type="button"
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-16 w-16 flex-shrink-0 rounded border-2 ${
                  idx === currentIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                <RevealImage
                  src={getAssetImageUrl(img)}
                  alt={img.fileName}
                  layout="constrained"
                  width={64}
                  height={64}
                  className="absolute inset-0 w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
