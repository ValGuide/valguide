import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useGuideEditorV2 } from '@/features/guides/contexts/guide-editor-v2-types'

interface StopsListV2Props {
  onReorder: (updates: Array<{ id: string; order: number }>) => void
  onEdit: (stopId: string) => void
  onDelete: (stopId: string) => Promise<void>
  onAdd: () => void
}

export function StopsListV2({ onReorder, onEdit, onDelete, onAdd }: StopsListV2Props) {
  const t = useTranslations('stops')
  const { stops, localeData, activeLocale } = useGuideEditorV2()

  const getStopTitle = (stopId: string) => {
    const stopTranslation = localeData?.stopTranslations.find((st) => st.stopId === stopId)
    return stopTranslation?.draftVersion?.title ?? stopTranslation?.currentVersion?.title ?? t('untitled')
  }

  if (stops.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="mb-4 text-sm text-muted-foreground">{t('empty')}</p>
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.add')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {stops.map((stop, index) => (
        <Card key={stop.id} className="group">
          <CardContent className="flex items-center gap-3 p-3">
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
              aria-label={t('actions.reorder')}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{getStopTitle(stop.id)}</span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(stop.id)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{t('actions.edit')}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(stop.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t('actions.delete')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={onAdd} variant="outline" size="sm" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        {t('actions.add')}
      </Button>
    </div>
  )
}
