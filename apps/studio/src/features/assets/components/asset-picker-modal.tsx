import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import { formatFileSize } from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Checkbox } from '@valguide/ui/components/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { Image } from '@valguide/ui/components/image'
import { Input } from '@valguide/ui/components/input'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { formatDistanceToNow } from 'date-fns'
import { Image as ImageIcon, Music, Search, Video } from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { AssetPickerVirtualGrid } from './asset-picker-virtual-grid'

// Keep the default selection array stable. A fresh [] here retriggers the sync effect
// on every render and causes an infinite setState loop in Storybook.
const EMPTY_SELECTED_ASSET_IDS: string[] = []

export type UploadInlineComponentProps = {
  organizationId: string
  allowedTypes?: AssetType[]
  locale?: string
  onUploadComplete?: (asset: Asset) => void
  onUploadBatchComplete?: (assets: Asset[], meta: { hasErrors: boolean }) => void
}

export type UploadInlineComponent = ComponentType<UploadInlineComponentProps>

export type AssetPickerModalProps = {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  type: AssetType
  locale?: string
  multiple?: boolean
  selectedAssetIds?: string[]
  onSelect: (assets: Asset[]) => void
  assets: AssetWithUsage[]
  isLoading: boolean
  isFetchingMore?: boolean
  hasMore?: boolean
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
  onLoadMore?: () => void
  onRefetch?: () => void
  onUploadComplete?: (asset: Asset) => void
  UploadInline?: UploadInlineComponent
}

export function AssetPickerModal({
  organizationId,
  open,
  onOpenChange,
  type,
  locale,
  multiple = false,
  selectedAssetIds = EMPTY_SELECTED_ASSET_IDS,
  onSelect,
  assets,
  isLoading,
  isFetchingMore = false,
  hasMore = false,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  onLoadMore,
  onRefetch,
  onUploadComplete: onUploadCompleteProp,
  UploadInline,
}: AssetPickerModalProps) {
  const t = useTranslations('assets.picker')
  // i18n-used-keys: assets.types.image, assets.types.audio, assets.types.video
  const tTypes = useTranslations('assets.types')
  const tFilter = useTranslations('assets.filter')
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedAssetIds))
  const selectedAssetIdsKey = useMemo(() => [...selectedAssetIds].sort().join('|'), [selectedAssetIds])
  const searchQuery = controlledSearchQuery ?? internalSearchQuery

  const setSearchQuery = (value: string) => {
    if (!onSearchQueryChange) {
      setInternalSearchQuery(value)
      return
    }

    onSearchQueryChange(value)
  }

  const displayedAssets = useMemo(() => assets, [assets])

  useEffect(() => {
    setSelected(new Set(selectedAssetIds))
  }, [selectedAssetIdsKey])

  const handleToggleAsset = (assetId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      if (multiple) {
        newSelected.add(assetId)
      } else {
        newSelected.clear()
        newSelected.add(assetId)
      }
    }
    setSelected(newSelected)
  }

  const handleSelect = () => {
    const selectedAssets = assets.filter((asset) => selected.has(asset.id))
    onSelect(selectedAssets)
    onOpenChange(false)
  }

  const handleUploadBatchComplete = (uploadedAssets: Asset[], meta: { hasErrors: boolean }) => {
    const lastUploadedAsset = uploadedAssets[uploadedAssets.length - 1]

    if (lastUploadedAsset) {
      onUploadCompleteProp?.(lastUploadedAsset)
    }

    if (uploadedAssets.length > 0) {
      onRefetch?.()
      setSelected((currentSelected) => {
        if (!multiple) {
          return new Set([uploadedAssets[uploadedAssets.length - 1]?.id].filter(Boolean))
        }

        const nextSelected = new Set(currentSelected)
        for (const asset of uploadedAssets) {
          nextSelected.add(asset.id)
        }
        return nextSelected
      })
    }

    if (!meta.hasErrors) {
      setActiveTab('library')
    }
  }

  const handleCancel = () => {
    setSelected(new Set(selectedAssetIds))
    onOpenChange(false)
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-12 w-12 text-muted-foreground" />
      case 'audio':
        return <Music className="h-12 w-12 text-muted-foreground" />
      case 'video':
        return <Video className="h-12 w-12 text-muted-foreground" />
    }
  }

  const renderAssetCard = (asset: Asset) => {
    const isSelected = selected.has(asset.id)

    return (
      // biome-ignore lint/a11y/useSemanticElements: Cannot use button due to nested Checkbox which renders as button
      <div
        role="button"
        tabIndex={0}
        key={asset.id}
        className={`relative rounded-xl border-2 transition-all cursor-pointer hover:shadow-md text-left ${
          isSelected ? 'border-primary shadow-sm' : 'border-border'
        }`}
        onClick={() => handleToggleAsset(asset.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggleAsset(asset.id)
          }
        }}
      >
        <div className="absolute right-2 top-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleToggleAsset(asset.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 border-2 shadow-sm bg-background/85 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary sm:h-6 sm:w-6"
          />
        </div>

        <div
          className={`flex items-center justify-center overflow-hidden bg-muted ${
            isMobile ? 'h-28 rounded-t-xl' : 'h-40 rounded-t-xl'
          }`}
        >
          {asset.type === 'image' ? (
            <Image
              src={getAssetImageUrl(asset)}
              alt={asset.fileName}
              layout="fullWidth"
              width={300}
              height={160}
              className="h-full w-full object-cover"
            />
          ) : (
            getTypeIcon()
          )}
        </div>

        <div className={isMobile ? 'space-y-1.5 p-2.5' : 'space-y-2 p-3'}>
          <h4
            className={isMobile ? 'line-clamp-2 text-xs leading-tight font-medium' : 'line-clamp-1 text-sm font-medium'}
            title={asset.fileName}
          >
            {asset.fileName}
          </h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className={isMobile ? 'px-2 py-0 text-[11px]' : 'text-xs'}>
              {formatFileSize(asset.fileSize)}
            </Badge>
          </div>
          {!isMobile ? (
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-none border-0 p-4 sm:top-[50%] sm:left-[50%] sm:h-[min(90vh,44rem)] sm:max-h-[90vh] sm:w-full sm:max-w-3xl lg:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle>
            {locale
              ? t('titleWithLocale', { type: tTypes(type), locale: locale.toUpperCase() })
              : t('title', { type: tTypes(type) })}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'library' | 'upload')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="library" className="rounded-lg text-sm font-medium">
              {t('tabs.library')}
            </TabsTrigger>
            <TabsTrigger value="upload" className="rounded-lg text-sm font-medium">
              {t('tabs.upload')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tFilter('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-xl pl-9 text-base sm:text-sm"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no unique ID
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : displayedAssets.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">{getTypeIcon()}</EmptyMedia>
                    <EmptyTitle>{t('noAssets', { type: tTypes(type) })}</EmptyTitle>
                    <EmptyDescription>{searchQuery ? tFilter('noResults') : t('empty.description')}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="min-h-0 flex-1">
                  <AssetPickerVirtualGrid
                    assets={displayedAssets}
                    renderAsset={renderAssetCard}
                    isMobile={isMobile}
                    loadingMoreLabel={t('loadingMore')}
                    onLoadMore={onLoadMore}
                    hasMore={hasMore}
                    isFetchingMore={isFetchingMore}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 flex min-h-0 flex-1 flex-col">
            {UploadInline && (
              <div className="flex min-h-0 flex-1 flex-col">
                <UploadInline
                  allowedTypes={[type]}
                  locale={locale}
                  onUploadBatchComplete={handleUploadBatchComplete}
                  organizationId={organizationId}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t bg-background/95 pt-3 backdrop-blur sm:flex sm:justify-end sm:gap-2 sm:border-0 sm:bg-transparent sm:pt-0">
          <Button variant="outline" onClick={handleCancel} className="h-11 rounded-xl px-4 sm:h-10 sm:rounded-md">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selected.size === 0}
            className="h-11 rounded-xl px-5 font-medium sm:h-10 sm:rounded-md"
          >
            {t('select')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
