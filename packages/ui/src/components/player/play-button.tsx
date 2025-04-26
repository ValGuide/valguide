import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Play, Pause } from 'lucide-react'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'

const playButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 w-10',
        sm: 'h-8 w-8',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface PlayButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof playButtonVariants> {
  asChild?: boolean
  isPlaying?: boolean
}

const PlayButton = React.forwardRef<HTMLButtonElement, PlayButtonProps & DataTestIdProps>(
  ({ className, variant, size, asChild = false, isPlaying = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(playButtonVariants({ variant, size, className }))} ref={ref} {...props}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Comp>
    )
  },
)
PlayButton.displayName = 'PlayButton'

export { PlayButton, playButtonVariants }
