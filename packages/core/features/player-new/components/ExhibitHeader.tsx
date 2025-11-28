'use client'

import { cn } from '@valguide/core/ui/lib/utils'
import { ChevronDown } from 'lucide-react'

interface ExhibitHeaderProps {
  title: string
  museumName: string
  onClose?: () => void
  className?: string
}

export function ExhibitHeader({ title, museumName, onClose, className }: ExhibitHeaderProps) {
  return (
    <div
      className={cn(
        'absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent px-6 pt-12 pb-20',
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-white/10 p-2 backdrop-blur-md transition-colors hover:bg-white/20"
        aria-label="Minimize"
      >
        <ChevronDown className="text-white" size={24} />
      </button>
      <div className="flex flex-col items-center text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-white/70 shadow-black drop-shadow-sm">
          {museumName}
        </span>
        <h1 className="mt-1 text-sm font-semibold text-white shadow-black drop-shadow-md">{title}</h1>
      </div>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  )
}
