import type { StopListItem } from '@valguide/core/features/guides/stop/list-stops'
import { useTranslations } from '@valguide/core/i18n/client'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'

interface StopsListContentProps {
  stops: StopListItem[]
  onEditStop?: (stop: StopListItem) => void
}

export function StopsListContent({ stops, onEditStop }: StopsListContentProps) {
  const t = useTranslations('stops')

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stops.map((stop) => {
        const title = stop.title || t('untitled')

        return (
          <Card
            key={stop.nanoId}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onEditStop?.(stop)}
          >
            <CardHeader>
              <CardTitle className="line-clamp-2">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground">
                {stop.availableLocales.length} {t('list.locales')}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
