import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'

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
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'defaultValue'>,
    VariantProps<typeof volumeControlVariants> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

const VolumeControl = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  VolumeControlProps & DataTestIdProps
>(({ className, variant, value = 50, onValueChange, ...props }, ref) => {
  const [volume, setVolume] = React.useState(value)
  const [isMuted, setIsMuted] = React.useState(false)
  const previousVolume = React.useRef(volume)

  React.useEffect(() => {
    setVolume(value)
  }, [value])

  const handleVolumeChange = (newValue: number[]) => {
    const vol = newValue[0]
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

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />
    if (volume < 33) return <Volume className="h-4 w-4" />
    if (volume < 66) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <div className={cn(volumeControlVariants({ variant, className }))}>
      <button
        type="button"
        onClick={handleMuteToggle}
        className="text-muted-foreground hover:text-foreground"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon />
      </button>
      <SliderPrimitive.Root
        ref={ref}
        className="relative flex h-5 w-32 touch-none select-none items-center"
        value={[volume]}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  )
})
VolumeControl.displayName = 'VolumeControl'

export { VolumeControl }
