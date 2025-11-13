'use client'

import { Badge } from '@valguide/ui/components/badge'
import { CheckCircle2, Edit3, Clock, Archive } from 'lucide-react'

type TranslationStatus = 'draft' | 'in_review' | 'published' | 'archived'

interface TranslationStatusBadgeProps {
  status: TranslationStatus | null | undefined
  hasDraft?: boolean
  className?: string
}

export function TranslationStatusBadge({ status, hasDraft, className }: TranslationStatusBadgeProps) {
  if (!status && !hasDraft) {
    return (
      <Badge variant="outline" className={className}>
        <Edit3 className="mr-1 h-3 w-3" />
        No content
      </Badge>
    )
  }

  if (hasDraft && status === 'published') {
    return (
      <Badge variant="secondary" className={className}>
        <Edit3 className="mr-1 h-3 w-3" />
        Draft changes
      </Badge>
    )
  }

  switch (status) {
    case 'draft':
      return (
        <Badge variant="secondary" className={className}>
          <Edit3 className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      )
    case 'in_review':
      return (
        <Badge variant="default" className={className}>
          <Clock className="mr-1 h-3 w-3" />
          In Review
        </Badge>
      )
    case 'published':
      return (
        <Badge variant="default" className={className}>
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Published
        </Badge>
      )
    case 'archived':
      return (
        <Badge variant="outline" className={className}>
          <Archive className="mr-1 h-3 w-3" />
          Archived
        </Badge>
      )
    default:
      return null
  }
}
