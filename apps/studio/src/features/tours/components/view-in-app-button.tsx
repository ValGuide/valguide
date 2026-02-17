import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ExternalLink } from 'lucide-react'

interface ViewInAppButtonProps {
  orgSlug: string
  tourSlug: string
  published: boolean
  appDomain?: string
}

export function ViewInAppButton({
  orgSlug,
  tourSlug,
  published,
  appDomain = 'app.valguide.com',
}: ViewInAppButtonProps) {
  const t = useTranslations('tours')

  if (!published) {
    return null
  }

  return (
    <Button variant="outline" asChild>
      <a href={`https://${appDomain}/${orgSlug}/${tourSlug}`} target="_blank" rel="noopener noreferrer">
        <ExternalLink />
        <span className="hidden sm:inline">{t('viewInApp')}</span>
      </a>
    </Button>
  )
}
