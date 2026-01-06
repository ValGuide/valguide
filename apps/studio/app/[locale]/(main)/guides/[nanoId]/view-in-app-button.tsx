'use client'

import { Button } from '@valguide/ui/components/button'
import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ViewInAppButtonProps {
  nanoId: string
  published: boolean
}

export function ViewInAppButton({ nanoId, published }: ViewInAppButtonProps) {
  const t = useTranslations('guides')

  if (!published) {
    return null
  }

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.valguide.com'

  return (
    <Button variant="outline" asChild>
      <a href={`https://${appDomain}/g/${nanoId}`} target="_blank" rel="noopener noreferrer">
        <ExternalLink />
        <span className="hidden sm:inline">{t('viewInApp')}</span>
      </a>
    </Button>
  )
}
