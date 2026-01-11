import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

const sectionPanelVariants = cva('rounded-lg', {
  variants: {
    variant: {
      default: 'border bg-card',
      subtle: 'border bg-muted/20',
      ghost: 'bg-transparent',
    },
    spacing: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    spacing: 'md',
  },
})

interface SectionPanelProps extends React.ComponentProps<'section'>, VariantProps<typeof sectionPanelVariants> {}

function SectionPanel({ className, variant, spacing, ...props }: SectionPanelProps) {
  return (
    <section
      data-slot="section-panel"
      className={cn(sectionPanelVariants({ variant, spacing }), className)}
      {...props}
    />
  )
}

function SectionPanelHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return <header data-slot="section-panel-header" className={cn('mb-4', className)} {...props} />
}

function SectionPanelTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="section-panel-title" className={cn('text-base font-semibold', className)} {...props} />
}

function SectionPanelDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="section-panel-description"
      className={cn('text-sm text-muted-foreground mt-1', className)}
      {...props}
    />
  )
}

function SectionPanelContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="section-panel-content" className={cn('', className)} {...props} />
}

export {
  SectionPanel,
  SectionPanelHeader,
  SectionPanelTitle,
  SectionPanelDescription,
  SectionPanelContent,
  sectionPanelVariants,
}
