import type { AssetWithUsage } from '@valguide/core/features/assets/queries'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
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
import { useMemo, useState } from 'react'
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
  error?: Error | null
  onAssetDeleted?: (assetId: string) => void
  onUploadComplete?: (asset: Asset) => void
  onRetry?: () => void
  AssetCard?: AssetCardComponent
  UploadInline?: UploadInlineComponent
}

export function AssetsList({
  locale,
  organizationId,
  assets = [],
  error = null,
  onAssetDeleted,
  onUploadComplete,
  onRetry,
  AssetCard,
  UploadInline,
}: AssetsListProps) {
  const t = useTranslations('assets')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssets = useMemo(() => {
    return (assets ?? []).filter((asset) => {
      const matchesType = typeFilter === 'all' || asset.type === typeFilter
      const matchesLocale =
        localeFilter === 'all' || asset.locale === localeFilter || (!asset.locale && localeFilter === 'none')
      const matchesSearch = !searchQuery || asset.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesLocale && matchesSearch
    })
  }, [assets, typeFilter, localeFilter, searchQuery])

  const handleUploadComplete = (asset: Asset) => {
    onUploadComplete?.(asset)
    setActiveTab('library')
  }

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
                <SelectItem value="en">{t('filter.localeEn')}</SelectItem>
                <SelectItem value="de">{t('filter.localeDe')}</SelectItem>
                <SelectItem value="rm">{t('filter.localeRm')}</SelectItem>
                <SelectItem value="none">{t('filter.noLocale')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assets Grid */}
          {filteredAssets.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>{t('empty.title')}</EmptyTitle>
                <EmptyDescription>{t('empty.description')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setActiveTab('upload')} size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  {t('empty.uploadButton')}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
              {filteredAssets.map((asset) =>
                AssetCard ? <AssetCard key={asset.id} asset={asset} onDelete={onAssetDeleted} /> : null,
              )}
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
