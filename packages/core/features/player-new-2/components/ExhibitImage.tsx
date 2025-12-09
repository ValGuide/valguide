'use client'

import { cn } from '@valguide/core/ui/lib/utils'
import Image from 'next/image'

interface ExhibitImageProps {
  src: string
  alt: string
  className?: string
}

export function ExhibitImage({ src, alt, className }: ExhibitImageProps) {
  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-2xl shadow-lg', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 400px"
      />
    </div>
  )
}
