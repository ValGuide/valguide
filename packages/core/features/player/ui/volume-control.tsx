import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import * as React from 'react'

const volumeControlVariants = cva('flex items-center gap-2', {
  variants: {
    variant: {
      default: '',
      compact: 'w-24',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface VolumeControlProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'defaultValue' | 'onValueChange'>,
    VariantProps<typeof volumeControlVariants> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

const VolumeControl = ({
  ref,
  className,
  variant,
  value = 50,
  onValueChange,
  ...props
}: VolumeControlProps & { ref?: React.Ref<React.ComponentRef<typeof SliderPrimitive.Root>> }) => {
  const [volume, setVolume] = React.useState(value)
  const [isMuted, setIsMuted] = React.useState(false)
  const previousVolume = React.useRef(volume)

  React.useEffect(() => {
    setVolume(value)
  }, [value])

  const handleVolumeChange = (newValue: number[]) => {
    const vol = newValue[0] ?? 0
    setVolume(vol)
    setIsMuted(vol === 0)
    if (onValueChange) {
      onValueChange(vol)
    }
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(previousVolume.current || 50)
      setIsMuted(false)
      if (onValueChange) {
        onValueChange(previousVolume.current || 50)
      }
    } else {
      previousVolume.current = volume
      setVolume(0)
      setIsMuted(true)
      if (onValueChange) {
        onValueChange(0)
      }
    }
  }

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  }

  const iconVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } },
  }

  // Custom component to add Framer Motion to the Thumb
  const MotionThumb = ({
    ref: thumbRef,
    ...thumbProps
  }: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb> & {
    ref?: React.RefObject<HTMLSpanElement>
  }) => {
    return (
      <SliderPrimitive.Thumb ref={thumbRef} {...thumbProps} asChild>
        <motion.span
          className="block h-3 w-3 rounded-full border border-primary/50 bg-background shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
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

  // Get the appropriate volume icon based on current volume
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return { icon: <VolumeX className="h-4 w-4" />, key: 'muted' }
    if (volume < 33) return { icon: <Volume className="h-4 w-4" />, key: 'low' }
    if (volume < 66) return { icon: <Volume1 className="h-4 w-4" />, key: 'medium' }
    return { icon: <Volume2 className="h-4 w-4" />, key: 'high' }
  }

  const { icon, key } = getVolumeIcon()

  return (
    <motion.div
      className={cn(volumeControlVariants({ variant, className }))}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.button
        type="button"
        onClick={handleMuteToggle}
        className="text-muted-foreground hover:text-foreground"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={key} initial="initial" animate="animate" exit="exit" variants={iconVariants}>
              {icon}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.button>
      <SliderPrimitive.Root
        {...props}
        ref={ref}
        className="relative flex h-5 w-32 touch-none select-none items-center"
        value={[volume]}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
        defaultValue={[props.defaultValue ?? 0]}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="absolute h-full bg-primary"
            initial={{ width: `${volume}%` }}
            animate={{ width: `${volume}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </SliderPrimitive.Track>
        <MotionThumb />
      </SliderPrimitive.Root>
    </motion.div>
  )
}
VolumeControl.displayName = 'VolumeControl'

export { VolumeControl }
