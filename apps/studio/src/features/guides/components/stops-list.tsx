import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { StopWithAssets } from '@valguide/core/features/guides/types'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import * as React from 'react'
import { TranslationStatusInline } from './translation-status-inline'

export type StopsListProps = {
  stops: StopWithAssets[]
  locale: string
  selectedStopId?: string
  onReorder: (updates: Array<{ id: string; order: number }>) => void
  onEdit: (stop: StopWithAssets) => void
  onDelete: (stopId: string) => void
  onAdd: () => void | Promise<void>
}

type SortableStopItemProps = {
  stop: StopWithAssets
  index: number
  locale: string
  selected: boolean
  onEdit: (stop: StopWithAssets) => void
  onDelete: (stopId: string) => void
}

function SortableStopItem({ stop, index, locale, selected, onEdit, onDelete }: SortableStopItemProps) {
  const t = useTranslations('stops')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const translation = stop.translations.find((t) => t.locale === locale)
  const fallbackTranslation = stop.translations[0]
  const displayTitle =
    getVersionedField(translation, 'title') || getVersionedField(fallbackTranslation, 'title') || 'Untitled Stop'

  const thumbnailAsset = stop.assets?.find((a) => a.mimeType?.startsWith('image/'))

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="flex items-center gap-4 p-4">
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {thumbnailAsset?.publicUrl ? (
              <img src={thumbnailAsset.publicUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-medium truncate">{t('stopTitle', { number: index + 1, title: displayTitle })}</h3>
            <TranslationStatusInline stop={stop} />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => onEdit(stop)}>
              {t('edit')}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(stop.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StopsList({ stops, locale, selectedStopId, onReorder, onEdit, onDelete, onAdd }: StopsListProps) {
  const t = useTranslations('stops')
  const [items, setItems] = React.useState(stops)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    setItems(stops)
  }, [stops])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const reorderedItems = arrayMove(items, oldIndex, newIndex)

      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        order: index,
      }))

      setItems(reorderedItems)
      onReorder(updates)
    }
  }

  if (stops.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Plus />
          </EmptyMedia>
          <EmptyTitle>{t('empty.title')}</EmptyTitle>
          <EmptyDescription>{t('empty.description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAdd} size="lg">
            <Plus />
            {t('add')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!isMounted) {
    return (
      <div className="space-y-3">
        {items.map((stop, index) => {
          const translation = stop.translations.find((t) => t.locale === locale)
          const fallbackTranslation = stop.translations[0]
          const displayTitle =
            getVersionedField(translation, 'title') ||
            getVersionedField(fallbackTranslation, 'title') ||
            'Untitled Stop'
          const thumbnailAsset = stop.assets?.find((a) => a.mimeType?.startsWith('image/'))

          return (
            <Card key={stop.id} className={`${stop.id === selectedStopId ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {thumbnailAsset?.publicUrl ? (
                    <img src={thumbnailAsset.publicUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-medium truncate">{t('stopTitle', { number: index + 1, title: displayTitle })}</h3>
                  <TranslationStatusInline stop={stop} />
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => onEdit(stop)}>
                    {t('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(stop.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        <Button onClick={onAdd} className="w-full" size="lg">
          <Plus />
          {t('add')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((stop, index) => (
              <SortableStopItem
                key={stop.id}
                stop={stop}
                index={index}
                locale={locale}
                selected={stop.id === selectedStopId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={onAdd} className="w-full" size="lg">
        <Plus />
        {t('add')}
      </Button>
    </div>
  )
}
