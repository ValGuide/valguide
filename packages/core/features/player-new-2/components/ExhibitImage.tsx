import { Image } from '@unpic/react'
import { cn } from '@valguide/core/ui/lib/utils'

interface ExhibitImageProps {
  src: string
  alt: string
  className?: string
}

export function ExhibitImage({ src, alt, className }: ExhibitImageProps) {
  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-2xl shadow-lg', className)}>
      <Image src={src} alt={alt} layout="fullWidth" className="absolute inset-0 w-full h-full object-cover" />
    </div>
  )
}
