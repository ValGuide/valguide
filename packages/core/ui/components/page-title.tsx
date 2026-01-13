import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const pageTitleVariants = cva('font-serif tracking-tight', {
  variants: {
    size: {
      sm: 'text-xl sm:text-2xl',
      md: 'text-2xl sm:text-3xl',
      lg: 'text-3xl sm:text-4xl',
      xl: 'text-4xl sm:text-5xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
  },
})

export interface PageTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function PageTitle({ className, size, weight, as: Component = 'h1', children, ...props }: PageTitleProps) {
  return (
    <Component className={cn(pageTitleVariants({ size, weight }), className)} {...props}>
      {children}
    </Component>
  )
}
