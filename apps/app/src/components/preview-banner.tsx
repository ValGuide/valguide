import { Link, useSearch } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Eye, X } from 'lucide-react'

export function PreviewBanner({ locale }: { locale: string }) {
  const t = useTranslations('player')
  const search = useSearch({ strict: false })

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-warning/20 bg-warning/10 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 shrink-0 text-warning" />
        <div>
          <span className="font-medium">{t('previewBanner.title')}</span>
          <span className="text-muted-foreground"> — {t('previewBanner.description')}</span>
          <span className="ml-2 rounded bg-warning/10 px-1.5 py-0.5 text-xs font-medium text-warning">
            {locale.toUpperCase()}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-xs" asChild>
        <Link to="." search={{ ...search, preview: undefined }}>
          <X className="h-3.5 w-3.5" />
          {t('previewBanner.exit')}
        </Link>
      </Button>
    </div>
  )
}
