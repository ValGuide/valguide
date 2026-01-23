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
import type { StopMetadata } from '@valguide/core/features/guides/types'
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
import { Archive, Edit, Eye, EyeOff, GripVertical, MoreVertical, Plus } from 'lucide-react'
import * as React from 'react'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { TranslationStatusInline } from './translation-status-inline'

export type StopsListProps = {
  onReorder: (updates: Array<{ id: string; order: number }>) => void
  onEdit: (stopId: string) => void
  onHide: (stopId: string) => Promise<void>
  onShow: (stopId: string) => Promise<void>
  onArchive: (stopId: string) => Promise<void>
  onAdd: () => void | Promise<void>
  /** @deprecated Use onArchive instead */
  onDelete?: (stopId: string) => Promise<void>
}

type SortableStopItemProps = {
  stop: StopMetadata
  index: number
  title: string
  onEdit: (stopId: string) => void
  onHide: (stopId: string) => Promise<void>
  onShow: (stopId: string) => Promise<void>
  onRequestArchive: (stop: StopMetadata) => void
}

function SortableStopItem({ stop, index, title, onEdit, onHide, onShow, onRequestArchive }: SortableStopItemProps) {
  const t = useTranslations('stops')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const thumbnailAsset = stop.assets?.find((a) => a.mimeType?.startsWith('image/'))
  const isHidden = stop.visible === false

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
            {thumbnailAsset?.publicUrl ? (
              <img src={thumbnailAsset.publicUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={cn('font-medium truncate', isHidden && 'text-muted-foreground')}>
                {t('stopTitle', { number: index + 1, title })}
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
            <TranslationStatusInline translationStatuses={stop.translationStatuses} />
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(stop.nanoId)}>
                  <Edit className="h-4 w-4" />
                  {t('edit')}
                </DropdownMenuItem>
                {isHidden ? (
                  <DropdownMenuItem onClick={() => onShow(stop.id)}>
                    <Eye className="h-4 w-4" />
                    {t('stopActions.showStop')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onHide(stop.id)}>
                    <EyeOff className="h-4 w-4" />
                    {t('stopActions.hideStop')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onRequestArchive(stop)}>
                  <Archive className="h-4 w-4" />
                  {t('stopActions.archiveStop')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StopsList({ onReorder, onEdit, onHide, onShow, onArchive, onAdd, onDelete }: StopsListProps) {
  const t = useTranslations('stops')
  const { stops, localeData } = useGuideEditor()
  const [items, setItems] = React.useState(stops)
  const [isMounted, setIsMounted] = React.useState(false)
  const [stopToArchive, setStopToArchive] = React.useState<StopMetadata | null>(null)

  const archiveAction = onArchive ?? onDelete
  if (!archiveAction) {
    throw new Error('StopsList requires either onArchive or onDelete prop')
  }

  const getStopTitle = React.useCallback(
    (stopId: string) => {
      const stopTranslation = localeData?.stopTranslations.find((st) => st.stopId === stopId)
      return stopTranslation?.draftVersion?.title ?? stopTranslation?.currentVersion?.title ?? t('untitled')
    },
    [localeData],
  )

  const handleConfirmArchive = React.useCallback(() => {
    if (stopToArchive) {
      archiveAction(stopToArchive.id)
      setStopToArchive(null)
    }
  }, [stopToArchive, archiveAction])

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

  const stopToArchiveTitle = React.useMemo(() => {
    if (!stopToArchive) return ''
    return getStopTitle(stopToArchive.id)
  }, [stopToArchive, getStopTitle])

  const archiveConfirmationDialog = (
    <AlertDialog open={!!stopToArchive} onOpenChange={(open) => !open && setStopToArchive(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('stopActions.archiveStop')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('stopActions.archiveConfirm')}
            <span className="mt-2 block font-medium text-foreground">{stopToArchiveTitle}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmArchive}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('stopActions.archiveStop')}
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
          const displayTitle = getStopTitle(stop.id)
          const thumbnailAsset = stop.assets?.find((a) => a.mimeType?.startsWith('image/'))
          const isHidden = stop.visible === false

          return (
            <Card key={stop.id} className={cn(isHidden && 'opacity-60')}>
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
                  <TranslationStatusInline translationStatuses={stop.translationStatuses} />
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(stop.nanoId)}>
                        <Edit className="h-4 w-4" />
                        {t('edit')}
                      </DropdownMenuItem>
                      {isHidden ? (
                        <DropdownMenuItem onClick={() => onShow(stop.id)}>
                          <Eye className="h-4 w-4" />
                          {t('stopActions.showStop')}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onHide(stop.id)}>
                          <EyeOff className="h-4 w-4" />
                          {t('stopActions.hideStop')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setStopToArchive(stop)}>
                        <Archive className="h-4 w-4" />
                        {t('stopActions.archiveStop')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
        <Button onClick={onAdd} className="w-full" size="lg">
          <Plus />
          {t('add')}
        </Button>
        {archiveConfirmationDialog}
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
                title={getStopTitle(stop.id)}
                onEdit={onEdit}
                onHide={onHide}
                onShow={onShow}
                onRequestArchive={setStopToArchive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={onAdd} className="w-full" size="lg">
        <Plus />
        {t('add')}
      </Button>
      {archiveConfirmationDialog}
    </div>
  )
}
