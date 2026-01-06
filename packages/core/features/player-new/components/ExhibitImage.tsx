'use client'

import { cn } from '@valguide/core/ui/lib/utils'
import { motion } from 'framer-motion'

interface ExhibitImageProps {
  src: string
  alt: string
  className?: string
}

export function ExhibitImage({ src, alt, className }: ExhibitImageProps) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {/* Blured background for filling space */}
      <div className="absolute inset-0 z-0 scale-110 opacity-50 blur-3xl">
        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Main Image */}
      <motion.div
        className="relative z-1 flex h-full w-full items-center justify-center p-8 sm:p-12"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-[32px] shadow-2xl ring-1 ring-white/10">
          <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </motion.div>
    </div>
  )
}
