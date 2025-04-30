import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'

const trackInfoVariants = cva('flex items-center gap-3', {
  variants: {
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface TrackInfoProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof trackInfoVariants> {
  title: string
  artist: string
  albumArt?: string
}

const TrackInfo = React.forwardRef<HTMLDivElement, TrackInfoProps & DataTestIdProps>(
  ({ className, variant, title, artist, albumArt, ...props }, ref) => {
    return (
      <div className={cn(trackInfoVariants({ variant, className }))} ref={ref} {...props}>
        {albumArt && (
          <div className="h-10 w-10 overflow-hidden rounded-md">
            <img src={albumArt} alt={`${title} by ${artist}`} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{artist}</span>
        </div>
      </div>
    )
  },
)
TrackInfo.displayName = 'TrackInfo'

export { TrackInfo, trackInfoVariants }
