'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@valguide/core/ui/lib/utils'
import * as React from 'react'

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
}

export function ProgressBar({ currentTime, duration, onSeek, className }: ProgressBarProps) {
  const [value, setValue] = React.useState([currentTime])
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    if (!isDragging) {
      setValue([currentTime])
    }
  }, [currentTime, isDragging])

  const handleValueChange = (newValue: number[]) => {
    setIsDragging(true)
    setValue(newValue)
  }

  const handleValueCommit = (newValue: number[]) => {
    setIsDragging(false)
    const val = newValue[0]
    if (typeof val === 'number') {
      onSeek(val)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-4" // Increased touch area
        value={value}
        max={duration}
        step={1}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        aria-label="Progress"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-white/20">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-white" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex w-full justify-between text-xs font-medium text-white/70">
        <span>{formatTime(value[0] ?? 0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
