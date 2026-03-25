import { RevealImage } from '@valguide/core/ui/components/reveal-image'
import { Music } from 'lucide-react'

type CoverImageProps = {
  src?: string | null
  alt: string
  className?: string
}

export function CoverImage({ src, alt, className = '' }: CoverImageProps) {
  if (!src) {
    return (
      <div
        className={`aspect-square bg-muted rounded-lg flex items-center justify-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Music className="h-16 w-16 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={`aspect-square rounded-lg overflow-hidden ${className}`}>
      <RevealImage src={src} alt={alt} layout="fullWidth" className="w-full h-full object-cover" />
    </div>
  )
}
