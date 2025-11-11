'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@valguide/ui/components/button'
import { Badge } from '@valguide/ui/components/badge'
import { Card, CardContent } from '@valguide/ui/components/card'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@valguide/ui/components/empty'
import type { Stop, StopWithTranslations } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'

export type StopsListProps = {
    stops: StopWithTranslations[]
    locale: SupportedLocale
    selectedStopId?: string
    onReorder: (updates: Array<{ id: string; order: number }>) => void
    onEdit: (stop: StopWithTranslations) => void
    onDelete: (stopId: string) => void
    onAdd: () => void
}

type SortableStopItemProps = {
    stop: StopWithTranslations
    index: number
    locale: SupportedLocale
    selected: boolean
    onEdit: (stop: StopWithTranslations) => void
    onDelete: (stopId: string) => void
}

function SortableStopItem({ stop, index, locale, selected, onEdit, onDelete }: SortableStopItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const translation = stop.translations.find((t) => t.locale === locale)
    const fallbackTranslation = stop.translations[0]
    const displayTitle = translation?.title || fallbackTranslation?.title || 'Untitled Stop'
    const displayLocale = translation?.locale || fallbackTranslation?.locale

    return (
        <div ref={setNodeRef} style={style} className="group">
            <Card className={`hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="flex items-center gap-4 p-4">
                    <button
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                        {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{displayTitle}</h3>
                            {displayLocale && (
                                <Badge variant="outline" className="text-xs uppercase shrink-0">
                                    {displayLocale}
                                </Badge>
                            )}
                        </div>
                        {stop.translations.length > 1 && (
                            <p className="text-sm text-muted-foreground">
                                {stop.translations.length} translations
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(stop)}
                        >
                            <Pencil />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(stop.id)}
                        >
                            <Trash2 />
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
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)

                const reorderedItems = arrayMove(items, oldIndex, newIndex)

                const updates = reorderedItems.map((item, index) => ({
                    id: item.id,
                    order: index,
                }))

                onReorder(updates)

                return reorderedItems
            })
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={onAdd}>
                    <Plus />
                    {t('add')}
                </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
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
        </div>
    )
}
