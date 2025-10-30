import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

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

const ProgressBar = ({ ref, className, variant, currentTime, duration, ...props }) => {
  // Custom component to add Framer Motion to the Thumb
  const MotionThumb = ({
    ref: thumbRef,
    ...thumbProps
  }: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb> & {
    ref: React.RefObject<HTMLSpanElement>
  }) => {
    return (
      <SliderPrimitive.Thumb ref={thumbRef} {...thumbProps} asChild>
        <motion.span
          className="block h-3.5 w-3.5 rounded-full border border-primary/50 bg-background shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          whileFocus={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </SliderPrimitive.Thumb>
    )
  }
  MotionThumb.displayName = 'MotionThumb'

  return (
    <motion.div
      className="flex w-full flex-col gap-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SliderPrimitive.Root ref={ref} className={cn(progressBarVariants({ variant, className }))} {...props}>
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="absolute h-full bg-primary"
            initial={{ width: `${props.value?.[0] || 0}%` }}
            animate={{ width: `${props.value?.[0] || 0}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </SliderPrimitive.Track>
        <MotionThumb />
      </SliderPrimitive.Root>
      {(currentTime || duration) && (
        <motion.div
          className="flex justify-between text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span>{currentTime || '0:00'}</span>
          <span>{duration || '0:00'}</span>
        </motion.div>
      )}
    </motion.div>
  )
}
ProgressBar.displayName = SliderPrimitive.Root.displayName

export { ProgressBar }
