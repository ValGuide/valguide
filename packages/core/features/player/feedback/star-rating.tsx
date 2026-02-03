import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../../ui/lib/utils'

type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  ariaLabel?: string
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-9 w-9',
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  ariaLabel = 'Rating',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value

  return (
    <fieldset aria-label={ariaLabel} className="flex gap-1 border-none p-0" onMouseLeave={() => setHoverValue(null)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((starValue) => {
        const isFilled = starValue <= displayValue
        const isSelected = starValue === value

        return (
          <button
            key={starValue}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${starValue} star${starValue === 1 ? '' : 's'}`}
            disabled={disabled}
            className={cn(
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            )}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => !disabled && setHoverValue(starValue)}
            onFocus={() => !disabled && setHoverValue(starValue)}
            onBlur={() => setHoverValue(null)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-muted-foreground',
              )}
            />
          </button>
        )
      })}
    </fieldset>
  )
}
