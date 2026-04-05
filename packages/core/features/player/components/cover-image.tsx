import { RevealImage } from '@valguide/core/ui/components/reveal-image'
import { Music } from 'lucide-react'
import type { CSSProperties } from 'react'

type CoverImageProps = {
  src?: string | null
  alt: string
  className?: string
}

export function CoverImage({ src, alt, className = '' }: CoverImageProps) {
  const coverStyle = { borderRadius: 'calc(var(--radius) + 0.25rem)' } satisfies CSSProperties

  if (!src) {
    return (
      <div
        className={`aspect-square bg-muted flex items-center justify-center ${className}`}
        style={coverStyle}
        role="img"
        aria-label={alt}
      >
        <Music className="h-16 w-16 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={`aspect-square overflow-hidden ${className}`} style={coverStyle}>
      <RevealImage src={src} alt={alt} layout="fullWidth" className="w-full h-full object-cover" />
    </div>
  )
}
