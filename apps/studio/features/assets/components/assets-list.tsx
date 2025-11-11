'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Image as ImageIcon, Music, Video, Search } from 'lucide-react'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@valguide/ui/components/select'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@valguide/ui/components/empty'
import { Skeleton } from '@valguide/ui/components/skeleton'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import { AssetCard } from './asset-card'
import { CustomAssetUpload } from './asset-upload-custom'

export type AssetsListProps = {
  assets?: Asset[]
  isLoading?: boolean
  error?: Error | null
  organizationId: string
  onAssetDeleted?: (assetId: string) => void
  onUploadComplete?: (asset: Asset) => void
}

export function AssetsList({
  assets = [],
  isLoading = false,
  error = null,
  organizationId,
  onAssetDeleted,
  onUploadComplete,
}: AssetsListProps) {
  const t = useTranslations('assets')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadType, setUploadType] = useState<AssetType>('image')

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesType = typeFilter === 'all' || asset.type === typeFilter
      const matchesLocale = localeFilter === 'all' || asset.locale === localeFilter || (!asset.locale && localeFilter === 'none')
      const matchesSearch = !searchQuery || asset.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesLocale && matchesSearch
    })
  }, [assets, typeFilter, localeFilter, searchQuery])

  const handleUploadClick = (type: AssetType) => {
    setUploadType(type)
    setUploadModalOpen(true)
  }

  const handleUploadComplete = (asset: Asset) => {
    setUploadModalOpen(false)
    onUploadComplete?.(asset)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Failed to load assets</EmptyTitle>
          <EmptyDescription>{error.message || 'An unexpected error occurred'}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  // Empty state when no assets exist
  if (assets.length === 0) {
    return (
      <>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>{t('empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button onClick={() => handleUploadClick('image')} size="lg">
                <ImageIcon />
                {t('empty.uploadImage')}
              </Button>
              <Button onClick={() => handleUploadClick('audio')} size="lg" variant="outline">
                <Music />
                {t('empty.uploadAudio')}
              </Button>
              <Button onClick={() => handleUploadClick('video')} size="lg" variant="outline">
                <Video />
                {t('empty.uploadVideo')}
              </Button>
            </div>
          </EmptyContent>
        </Empty>

        {/* Upload Modal */}
        <CustomAssetUpload
          key={uploadType}
          type={uploadType}
          organizationId={organizationId}
          onUploadComplete={handleUploadComplete}
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus />
          {t('upload.button')}
        </Button>
      </div>

      {/* Filters */}
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

        <Select value={localeFilter} onValueChange={setLocaleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.allLocales')}</SelectItem>
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="de">DE</SelectItem>
            <SelectItem value="rm">RM</SelectItem>
            <SelectItem value="none">No locale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{t('filter.noResults')}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onDelete={onAssetDeleted} />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <CustomAssetUpload
        key={uploadType}
        type={uploadType}
        organizationId={organizationId}
        onUploadComplete={handleUploadComplete}
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
    </div>
  )
}
