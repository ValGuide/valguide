import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'

const playButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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

const PlayButton = (
  {
    ref,
    className,
    variant,
    size,
    asChild = false,
    isPlaying = false,
    ...props
  }
) => {
  // Animation variants for the button
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
    playing: {
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        repeatType: 'reverse' as const,
        duration: 1.5,
      },
    },
  }

  // Animation variants for the icons
  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  }

  const buttonContent = (
    <div className="relative w-4 h-4 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.div
            key="pause"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={iconVariants}
            className="absolute"
          >
            <Pause className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={iconVariants}
            className="absolute"
          >
            <Play className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (asChild) {
    return (
      <Slot className={cn(playButtonVariants({ variant, size, className }))} ref={ref} {...props}>
        {buttonContent}
      </Slot>
    )
  }

  // Use type assertion to avoid type conflicts with onDrag
  return (
    <motion.button
      className={cn(playButtonVariants({ variant, size, className }))}
      ref={ref}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isPlaying ? 'playing' : 'initial'}
      variants={buttonVariants}
      {...(props as any)}
    >
      {buttonContent}
    </motion.button>
  )
}
PlayButton.displayName = 'PlayButton'

export { PlayButton, playButtonVariants }
