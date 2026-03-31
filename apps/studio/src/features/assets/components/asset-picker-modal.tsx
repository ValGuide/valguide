import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import { formatFileSize } from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Checkbox } from '@valguide/ui/components/checkbox'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { Input } from '@valguide/ui/components/input'
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { RevealImage } from '@valguide/ui/components/reveal-image'
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
        className={`relative cursor-pointer rounded-2xl border-2 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md ${
          isSelected ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-border'
        }`}
        onClick={() => handleToggleAsset(asset.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggleAsset(asset.id)
          }
        }}
      >
        <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleToggleAsset(asset.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 border-2 shadow-sm bg-background/85 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary sm:h-6 sm:w-6"
          />
        </div>

        <div
          className={`flex items-center justify-center overflow-hidden bg-muted ${
            isMobile ? 'h-40 rounded-t-2xl sm:h-32' : 'h-44 rounded-t-2xl lg:h-48'
          }`}
        >
          {asset.type === 'image' ? (
            <RevealImage
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

        <div className={isMobile ? 'space-y-2 p-3' : 'space-y-2.5 p-3.5 lg:p-4'}>
          <h4
            className={
              isMobile
                ? 'line-clamp-2 text-sm leading-snug font-medium'
                : 'line-clamp-2 text-sm leading-snug font-medium'
            }
            title={asset.fileName}
          >
            {asset.fileName}
          </h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className={isMobile ? 'px-2 py-0.5 text-[11px]' : 'text-xs'}>
              {formatFileSize(asset.fileSize)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden px-3 pb-3 pt-2 sm:h-[min(90vh,44rem)] sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:rounded-lg sm:border sm:p-5 lg:max-w-4xl lg:p-6">
        <ResponsiveDialogHeader className="pr-8 pb-1 sm:pb-0">
          <ResponsiveDialogTitle>
            {locale
              ? t('titleWithLocale', { type: tTypes(type), locale: locale.toUpperCase() })
              : t('title', { type: tTypes(type) })}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'library' | 'upload')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl sm:h-12">
            <TabsTrigger value="library" className="rounded-lg text-sm font-medium">
              {t('tabs.library')}
            </TabsTrigger>
            <TabsTrigger value="upload" className="rounded-lg text-sm font-medium">
              {t('tabs.upload')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-3 flex min-h-0 flex-1 flex-col sm:mt-4">
            <div className="relative mb-3 shrink-0 sm:mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tFilter('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl pl-9 text-base sm:h-12 sm:text-sm"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                  {[...Array(6)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no unique ID
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-48 w-full rounded-xl sm:h-40 lg:h-44" />
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

        <ResponsiveDialogFooter className="!grid grid-cols-2 items-center gap-3 border-t border-border/70 bg-background/95 pt-2.5 backdrop-blur sm:flex sm:justify-end sm:gap-2 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-11 w-full rounded-xl px-4 sm:h-10 sm:w-auto sm:rounded-md"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selected.size === 0}
            className="h-11 w-full rounded-xl px-5 font-medium sm:h-10 sm:w-auto sm:rounded-md"
          >
            {t('select')}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
