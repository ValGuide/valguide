'use client'

import type { AssetWithRole } from '@valguide/core/features/guides/queries'
import { Button } from '@valguide/core/ui/components/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

type ImageGalleryProps = {
  images: AssetWithRole[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  const currentImage = images[currentIndex]
  if (!currentImage) return null

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-muted">
        {currentImage.publicUrl && (
          <Image
            src={currentImage.publicUrl}
            alt={currentImage.fileName}
            fill
            className="object-contain"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        )}
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
              {currentIndex + 1} / {images.length}
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
                {img.publicUrl && (
                  <Image src={img.publicUrl} alt={img.fileName} fill className="object-cover rounded" sizes="64px" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
