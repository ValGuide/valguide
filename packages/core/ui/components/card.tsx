import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

const cardVariants = cva('bg-card text-card-foreground flex flex-col rounded-lg transition-all duration-200', {
  variants: {
    variant: {
      default: 'border shadow-[var(--shadow-card)]',
      elevated: 'shadow-[var(--shadow-md)] border-transparent',
      outline: 'border shadow-none',
      ghost: 'border-transparent shadow-none bg-transparent',
    },
    interactive: {
      true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20',
      false: '',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    interactive: false,
    padding: 'none',
  },
})

interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {}

function Card({ className, variant, interactive, padding, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ variant, interactive, padding }), className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6 py-4', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 pb-6 pt-2 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, cardVariants }
