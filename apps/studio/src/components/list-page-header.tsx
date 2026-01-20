import { PageTitle } from '@valguide/ui/components/page-title'
import { Skeleton } from '@valguide/ui/components/skeleton'
import type { ReactNode } from 'react'

interface ListPageHeaderProps {
  title: string
  description: string
  action?: ReactNode
}

export function ListPageHeader({ title, description, action }: ListPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <PageTitle as="h2">{title}</PageTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function ListPageHeaderSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      {hasAction && <Skeleton className="h-9 w-40" />}
    </div>
  )
}
