import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'

const progressBarVariants = cva('relative flex w-full touch-none select-none items-center', {
  variants: {
    variant: {
      default: '',
      compact: 'h-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface ProgressBarProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof progressBarVariants> {
  currentTime?: string
  duration?: string
}

const ProgressBar = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, ProgressBarProps & DataTestIdProps>(
  ({ className, variant, currentTime, duration, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1">
        <SliderPrimitive.Root ref={ref} className={cn(progressBarVariants({ variant, className }))} {...props}>
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-3.5 w-3.5 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
        {(currentTime || duration) && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentTime || '0:00'}</span>
            <span>{duration || '0:00'}</span>
          </div>
        )}
      </div>
    )
  },
)
ProgressBar.displayName = SliderPrimitive.Root.displayName

export { ProgressBar }
