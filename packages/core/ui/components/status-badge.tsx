import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

const statusBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 font-medium whitespace-nowrap shrink-0 transition-colors',
  {
    variants: {
      status: {
        published:
          'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/20',
        draft:
          'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/20',
        modified:
          'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/20',
        archived:
          'border-slate-400/30 bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-500/20',
        empty:
          'border-slate-300/30 bg-slate-50/50 text-slate-500 dark:bg-slate-800/30 dark:text-slate-500 dark:border-slate-600/20',
      },
      size: {
        sm: 'text-[10px] uppercase tracking-wider px-1.5 py-px',
        md: 'text-[11px] uppercase tracking-wide',
        lg: 'text-xs uppercase tracking-wide px-2.5 py-1',
      },
    },
    defaultVariants: {
      status: 'draft',
      size: 'md',
    },
  },
)

export type StatusType = 'published' | 'draft' | 'modified' | 'archived' | 'empty'

interface StatusBadgeProps
  extends Omit<React.ComponentProps<'span'>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  children?: React.ReactNode
}

function StatusBadge({ className, status, size, children, ...props }: StatusBadgeProps) {
  return (
    <span data-slot="status-badge" className={cn(statusBadgeVariants({ status, size }), className)} {...props}>
      {children ?? status}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
