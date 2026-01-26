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
import type { StructureDraftStop } from '@valguide/core/features/guides/structure/get-structure-draft'
import { useTranslations } from '@valguide/core/i18n/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@valguide/ui/components/alert-dialog'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import { cn } from '@valguide/ui/lib/utils'
import { Edit, Eye, EyeOff, GripVertical, MoreVertical, Plus, Unlink } from 'lucide-react'
import * as React from 'react'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'

export type StopsListProps = {
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

  return (
    <div ref={setNodeRef} style={style}>
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
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10" />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(stop.stopNanoId)}>
                <Edit className="h-4 w-4" />
                {t('edit')}
              </DropdownMenuItem>
              {isHidden ? (
                <DropdownMenuItem onClick={() => onShow(stop.stopNanoId)}>
                  <Eye className="h-4 w-4" />
                  {t('stopActions.showStop')}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onHide(stop.stopNanoId)}>
                  <EyeOff className="h-4 w-4" />
                  {t('stopActions.hideStop')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onRequestRemove(stop)}>
                <Unlink className="h-4 w-4" />
                {t('stopActions.removeStop')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </div>
  )
}

export function StopsList({ onReorder, onEdit, onHide, onShow, onRemove, onAdd }: StopsListProps) {
  const t = useTranslations('stops')
  const { stops } = useGuideEditor()
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

  const removeConfirmationDialog = (
    <AlertDialog open={!!stopToRemove} onOpenChange={(open) => !open && setStopToRemove(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('stopActions.removeStop')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('stopActions.removeDescription')}
            <span className="mt-2 block font-medium text-foreground">{stopToRemoveTitle}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmRemove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('stopActions.removeConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

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
          const displayTitle = stop.title?.trim() || t('untitled')
          const isHidden = stop.visible === false
          return (
            <Card key={stop.stopNanoId} className={cn(isHidden && 'opacity-60')}>
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10" />
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
        <Button onClick={onAdd} className="w-full" size="lg">
          <Plus />
          {t('add')}
        </Button>
        {removeConfirmationDialog}
      </div>
    )
  }

  return (
    <div className="space-y-3">
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
      <Button onClick={onAdd} className="w-full" size="lg">
        <Plus />
        {t('add')}
      </Button>
      {removeConfirmationDialog}
    </div>
  )
}
