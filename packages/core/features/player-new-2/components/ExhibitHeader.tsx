'use client'

import { cn } from '@valguide/core/ui/lib/utils'

interface ExhibitHeaderProps {
  title: string
  subtitle: string
  className?: string
}

export function ExhibitHeader({ title, subtitle, className }: ExhibitHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <h1 className="text-xl sm:text-2xl font-bold text-black">{title}</h1>
      <p className="text-sm sm:text-base text-gray-500">{subtitle}</p>
    </div>
  )
}
