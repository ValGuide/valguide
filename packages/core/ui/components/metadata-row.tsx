import { cn } from '@valguide/ui/lib/utils'
import type * as React from 'react'

interface MetadataRowProps extends React.ComponentProps<'div'> {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
}

function MetadataRow({ className, label, value, icon, ...props }: MetadataRowProps) {
  return (
    <div data-slot="metadata-row" className={cn('space-y-1', className)} {...props}>
      <dt className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {icon && <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

interface MetadataGridProps extends React.ComponentProps<'dl'> {}

function MetadataGrid({ className, children, ...props }: MetadataGridProps) {
  return (
    <dl
      data-slot="metadata-grid"
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
      {...props}
    >
      {children}
    </dl>
  )
}

interface MetadataInlineProps extends React.ComponentProps<'div'> {
  items: Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }>
  separator?: React.ReactNode
}

function MetadataInline({ className, items, separator = '·', ...props }: MetadataInlineProps) {
  return (
    <div
      data-slot="metadata-inline"
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground', className)}
      {...props}
    >
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          {index > 0 && <span className="mr-3 opacity-40">{separator}</span>}
          {item.icon && <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>}
          <span>{item.value}</span>
        </span>
      ))}
    </div>
  )
}

export { MetadataRow, MetadataGrid, MetadataInline }
