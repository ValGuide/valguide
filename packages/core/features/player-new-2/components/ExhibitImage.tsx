'use client'

import { cn } from '@valguide/core/ui/lib/utils'

interface ExhibitImageProps {
  src: string
  alt: string
  className?: string
}

export function ExhibitImage({ src, alt, className }: ExhibitImageProps) {
  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-2xl shadow-lg', className)}>
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  )
}
