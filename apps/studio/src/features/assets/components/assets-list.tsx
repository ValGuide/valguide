import { useVirtualizer } from '@tanstack/react-virtual'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { Input } from '@valguide/ui/components/input'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { Image as ImageIcon, Search, Upload } from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { AssetUploadInlineProps } from '@/features/assets/components/asset-upload-inline.tsx'

export type AssetCardComponentProps = {
  asset: AssetWithUsage
  onDelete?: (assetId: string) => void
}

export type AssetCardComponent = ComponentType<AssetCardComponentProps>

export type UploadInlineComponent = ComponentType<AssetUploadInlineProps>

export type AssetsListProps = {
  organizationId: string
  locale?: string
  assets?: AssetWithUsage[]
  hasMore?: boolean
  isFetchingMore?: boolean
  error?: Error | null
  onAssetDeleted?: (assetId: string) => void
  onUploadComplete?: (asset: Asset) => void
  onLoadMore?: () => void
  onRetry?: () => void
  typeFilter?: AssetType | 'all'
  onTypeFilterChange?: (value: AssetType | 'all') => void
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
  AssetCard?: AssetCardComponent
  UploadInline?: UploadInlineComponent
}

const GRID_GAP = 16
const MIN_CARD_WIDTH = 240
const ESTIMATED_CARD_HEIGHT = 396

export function AssetsList({
  locale,
  organizationId,
  assets = [],
  hasMore = false,
  isFetchingMore = false,
  error = null,
  onAssetDeleted,
  onUploadComplete,
  onLoadMore,
  onRetry,
  typeFilter: controlledTypeFilter,
  onTypeFilterChange,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  AssetCard,
  UploadInline,
}: AssetsListProps) {
  const t = useTranslations('assets')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [internalTypeFilter, setInternalTypeFilter] = useState<AssetType | 'all'>('all')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const gridViewportRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const typeFilter = controlledTypeFilter ?? internalTypeFilter
  const searchQuery = controlledSearchQuery ?? internalSearchQuery

  const setTypeFilter = (value: AssetType | 'all') => {
    if (!onTypeFilterChange) {
      setInternalTypeFilter(value)
      return
    }
    onTypeFilterChange(value)
  }

  const setSearchQuery = (value: string) => {
    if (!onSearchQueryChange) {
      setInternalSearchQuery(value)
      return
    }
    onSearchQueryChange(value)
  }

  const filteredAssets = useMemo(() => {
    return (assets ?? []).filter((asset) => {
      const matchesType = typeFilter === 'all' || asset.type === typeFilter
      const matchesSearch = !searchQuery || asset.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [assets, typeFilter, searchQuery])

  const handleUploadComplete = (asset: Asset) => {
    onUploadComplete?.(asset)
    setActiveTab('library')
  }

  useEffect(() => {
    const element = gridViewportRef.current
    if (!element) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 })
  }, [typeFilter, searchQuery])

  const columnCount = useMemo(() => {
    const adjustedWidth = containerWidth > 0 ? containerWidth + GRID_GAP : MIN_CARD_WIDTH + GRID_GAP
    return Math.max(1, Math.floor(adjustedWidth / (MIN_CARD_WIDTH + GRID_GAP)))
  }, [containerWidth])

  const rowCount = Math.ceil(filteredAssets.length / columnCount)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 4,
  })
  const virtualRows = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingMore || virtualRows.length === 0) {
      return
    }
    const scrollElement = scrollContainerRef.current
    if (!scrollElement) {
      return
    }
    const distanceFromBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight
    if (distanceFromBottom <= ESTIMATED_CARD_HEIGHT * 2) {
      onLoadMore()
    }
  }, [hasMore, isFetchingMore, onLoadMore, virtualRows])

  // Error state
  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{t('error.failedToLoad')}</EmptyTitle>
          <EmptyDescription>{error.message || t('error.unexpected')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry} variant="outline">
            {t('error.tryAgain')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'library' | 'upload')} className="space-y-6">
        <TabsList>
          <TabsTrigger value="library" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            {t('picker.tabs.library')}
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            {t('picker.tabs.upload')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('filter.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AssetType | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.all')}</SelectItem>
                <SelectItem value="image">{t('filter.image')}</SelectItem>
                <SelectItem value="audio">{t('filter.audio')}</SelectItem>
                <SelectItem value="video">{t('filter.video')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredAssets.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>
                  {searchQuery || typeFilter !== 'all' ? t('filter.noResults') : t('empty.title')}
                </EmptyTitle>
                <EmptyDescription>
                  {searchQuery || typeFilter !== 'all' ? t('filter.noResults') : t('empty.description')}
                </EmptyDescription>
              </EmptyHeader>
              {!searchQuery && typeFilter === 'all' && (
                <EmptyContent>
                  <Button onClick={() => setActiveTab('upload')} size="lg">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('empty.uploadButton')}
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div ref={gridViewportRef} className="w-full">
              <div ref={scrollContainerRef} className="h-[70vh] overflow-auto rounded-lg">
                <div
                  className="relative w-full"
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                  }}
                >
                  {virtualRows.map((virtualRow) => {
                    const rowStart = virtualRow.index * columnCount
                    const rowItems = filteredAssets.slice(rowStart, rowStart + columnCount)

                    return (
                      <div
                        key={virtualRow.key}
                        className="absolute left-0 top-0 w-full"
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div
                          className="grid"
                          style={{
                            gap: `${GRID_GAP}px`,
                            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                          }}
                        >
                          {rowItems.map((asset) =>
                            AssetCard ? <AssetCard key={asset.id} asset={asset} onDelete={onAssetDeleted} /> : null,
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {isFetchingMore ? (
                  <div className="py-3 text-center text-sm text-muted-foreground">{t('loadingMore')}</div>
                ) : null}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <div className="mx-auto w-full max-w-2xl">
            {UploadInline && (
              <UploadInline onUploadComplete={handleUploadComplete} organizationId={organizationId} locale={locale} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
