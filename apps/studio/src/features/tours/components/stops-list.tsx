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
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { StructureDraftStop } from '@valguide/core/features/tours/structure/get-structure-draft.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { Image } from '@valguide/ui/components/image'
import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import { cn } from '@valguide/ui/lib/utils'
import { Edit, Eye, EyeOff, GripVertical, MoreVertical, Plus, Unlink } from 'lucide-react'
import * as React from 'react'
import { ListError } from '@/components/list-error'
import { RemoveStopDialog } from './remove-stop-dialog'
import { StopsListLoading } from './stops-list-loading'

export type StopsListProps = {
  stops: StructureDraftStop[]
  isLoading?: boolean
  error?: Error | null
  isAddingStop?: boolean
  onRetry?: () => void
  onReorder: (stopNanoIds: string[]) => void
  onEdit: (stopNanoId: string) => void
  onHide: (stopNanoId: string) => void | Promise<void>
  onShow: (stopNanoId: string) => void | Promise<void>
  onRemove: (stopNanoId: string) => Promise<void>
  onAdd: () => void | Promise<void>
}

type SortableStopItemProps = {
  stop: StructureDraftStop
  index: number
  onEdit: (stopNanoId: string) => void
  onHide: (stopNanoId: string) => void | Promise<void>
  onShow: (stopNanoId: string) => void | Promise<void>
  onRequestRemove: (stop: StructureDraftStop) => void
}

function SortableStopItem({ stop, index, onEdit, onHide, onShow, onRequestRemove }: SortableStopItemProps) {
  const t = useTranslations('stops')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.stopNanoId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isHidden = stop.visible === false
  const displayTitle = stop.title?.trim() || t('untitled')
  const thumbnailUrl = stop.thumbnailUrl ? getAssetImageUrl({ storagePath: stop.thumbnailUrl }) : null

  return (
    <div ref={setNodeRef} style={style} data-testid="tour-stop-item" data-stop-nanoid={stop.stopNanoId}>
      <Card className={cn('hover:shadow-md transition-shadow', isHidden && 'opacity-60')}>
        <CardContent className="flex items-center gap-4 p-4">
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt="" layout="fullWidth" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={cn('font-medium truncate', isHidden && 'text-muted-foreground')}>
                {t('stopTitle', { number: index + 1, title: displayTitle })}
              </h3>
              {isHidden && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>{t('visibility.hiddenIndicator')}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => onEdit(stop.stopNanoId)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => onEdit(stop.stopNanoId)}>
              <Edit className="h-4 w-4" />
              {t('edit')}
            </Button>

            {isHidden ? (
              <>
                <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => onShow(stop.stopNanoId)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => onShow(stop.stopNanoId)}
                >
                  <Eye className="h-4 w-4" />
                  {t('stopActions.showStop')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => onHide(stop.stopNanoId)}>
                  <EyeOff className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => onHide(stop.stopNanoId)}
                >
                  <EyeOff className="h-4 w-4" />
                  {t('stopActions.hideStop')}
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={() => onRequestRemove(stop)}>
                  <Unlink className="h-4 w-4" />
                  {t('stopActions.removeStop')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StopsList({
  stops,
  isLoading = false,
  error = null,
  isAddingStop = false,
  onRetry,
  onReorder,
  onEdit,
  onHide,
  onShow,
  onRemove,
  onAdd,
}: StopsListProps) {
  const t = useTranslations('stops')
  const [items, setItems] = React.useState(stops)
  const [isMounted, setIsMounted] = React.useState(false)
  const [stopToRemove, setStopToRemove] = React.useState<StructureDraftStop | null>(null)

  const handleConfirmRemove = React.useCallback(() => {
    if (stopToRemove) {
      onRemove(stopToRemove.stopNanoId)
      setStopToRemove(null)
    }
  }, [stopToRemove, onRemove])

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    setItems(stops)
  }, [stops])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.stopNanoId === active.id)
      const newIndex = items.findIndex((item) => item.stopNanoId === over.id)
      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      setItems(reorderedItems)
      onReorder(reorderedItems.map((item) => item.stopNanoId))
    }
  }

  const stopToRemoveTitle = stopToRemove?.title?.trim() || t('untitled')

  if (isLoading) {
    return <StopsListLoading />
  }

  if (error) {
    return <ListError error={error} onRetry={onRetry} title={t('list.error')} />
  }

  if (stops.length === 0) {
    return (
      <Empty className="border" data-testid="tour-stops-list-empty">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Plus />
          </EmptyMedia>
          <EmptyTitle>{t('empty.title')}</EmptyTitle>
          <EmptyDescription>{t('empty.description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAdd} size="lg" data-testid="tour-stops-add-button" disabled={isAddingStop}>
            <Plus />
            {isAddingStop ? t('adding') : t('add')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!isMounted) {
    return (
      <div className="space-y-3" data-testid="tour-stops-list">
        {items.map((stop, index) => {
          const displayTitle = stop.title?.trim() || t('untitled')
          const isHidden = stop.visible === false
          const thumbnailUrl = stop.thumbnailUrl ? getAssetImageUrl({ storagePath: stop.thumbnailUrl }) : null
          return (
            <Card key={stop.stopNanoId} className={cn(isHidden && 'opacity-60')}>
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {thumbnailUrl ? (
                    <Image src={thumbnailUrl} alt="" layout="fullWidth" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn('font-medium truncate', isHidden && 'text-muted-foreground')}>
                    {t('stopTitle', { number: index + 1, title: displayTitle })}
                  </h3>
                </div>
              </CardContent>
            </Card>
          )
        })}
        <Button
          onClick={onAdd}
          className="w-full"
          size="lg"
          data-testid="tour-stops-add-button"
          disabled={isAddingStop}
        >
          <Plus />
          {isAddingStop ? t('adding') : t('add')}
        </Button>
        <RemoveStopDialog
          open={!!stopToRemove}
          onOpenChange={(open) => !open && setStopToRemove(null)}
          stopTitle={stopToRemoveTitle}
          onConfirm={handleConfirmRemove}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3" data-testid="tour-stops-list">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.stopNanoId)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((stop, index) => (
              <SortableStopItem
                key={stop.stopNanoId}
                stop={stop}
                index={index}
                onEdit={onEdit}
                onHide={onHide}
                onShow={onShow}
                onRequestRemove={setStopToRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={onAdd} className="w-full" size="lg" data-testid="tour-stops-add-button" disabled={isAddingStop}>
        <Plus />
        {isAddingStop ? t('adding') : t('add')}
      </Button>
      <RemoveStopDialog
        open={!!stopToRemove}
        onOpenChange={(open) => !open && setStopToRemove(null)}
        stopTitle={stopToRemoveTitle}
        onConfirm={handleConfirmRemove}
      />
    </div>
  )
}
