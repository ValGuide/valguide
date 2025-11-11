'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Button } from '@valguide/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { Checkbox } from '@valguide/ui/components/checkbox'
import { Input } from '@valguide/ui/components/input'
import { Badge } from '@valguide/ui/components/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@valguide/ui/components/empty'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { Search, Image as ImageIcon, Music, Video, Upload } from 'lucide-react'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import { formatDistanceToNow } from 'date-fns'

export type AssetPickerModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: AssetType
    locale?: string
    organizationId: string
    multiple?: boolean
    selectedAssetIds?: string[]
    onSelect: (assets: Asset[]) => void
    assets?: Asset[]
    isLoading?: boolean
    onUploadComplete?: (asset: Asset) => void
}

export function AssetPickerModal({
    open,
    onOpenChange,
    type,
    locale,
    organizationId,
    multiple = false,
    selectedAssetIds = [],
    onSelect,
    assets = [],
    isLoading = false,
    onUploadComplete,
}: AssetPickerModalProps) {
    const t = useTranslations('assets.picker')
    const tTypes = useTranslations('assets.types')
    const tFilter = useTranslations('assets.filter')
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
    const [searchQuery, setSearchQuery] = useState('')
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedAssetIds))

    const filteredAssets = useMemo(() => {
        let filtered = assets.filter((asset) => asset.type === type)

        if (locale) {
            filtered = filtered.filter((asset) => asset.locale === locale)
        }

        if (searchQuery) {
            filtered = filtered.filter((asset) =>
                asset.fileName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [assets, type, locale, searchQuery])

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

    const handleUploadClick = () => {
        const mockAsset: Asset = {
            id: `new-${Date.now()}`,
            nanoId: `new-${Date.now()}`,
            fileName: `uploaded-${type}.${type === 'image' ? 'jpg' : type === 'audio' ? 'mp3' : 'mp4'}`,
            fileSize: 1024 * 1024,
            mimeType: type === 'image' ? 'image/jpeg' : type === 'audio' ? 'audio/mpeg' : 'video/mp4',
            type,
            storagePath: 'mock/path',
            publicUrl: type === 'image' ? 'https://picsum.photos/400/300' : null,
            locale: locale || null,
            width: null,
            height: null,
            duration: null,
            organizationId,
            uploadedBy: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        onUploadComplete?.(mockAsset)
        setActiveTab('library')
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {t('title', { type: tTypes(type) })}
                        {locale && <span className="ml-2 text-muted-foreground">({locale.toUpperCase()})</span>}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'library' | 'upload')} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="library">{t('tabs.library')}</TabsTrigger>
                        <TabsTrigger value="upload">{t('tabs.upload')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={tFilter('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Assets Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="space-y-3">
                                            <Skeleton className="h-40 w-full rounded-lg" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAssets.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">{getTypeIcon()}</EmptyMedia>
                                        <EmptyTitle>{t('noAssets', { type: tTypes(type) })}</EmptyTitle>
                                        <EmptyDescription>
                                            {searchQuery ? tFilter('noResults') : t('empty.description')}
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredAssets.map((asset) => {
                                        const isSelected = selected.has(asset.id)
                                        return (
                                            <div
                                                key={asset.id}
                                                className={`relative rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-primary shadow-sm' : 'border-border'
                                                    }`}
                                                onClick={() => handleToggleAsset(asset.id)}
                                            >
                                                {/* Checkbox */}
                                                <div className="absolute top-2 right-2 z-10">
                                                    <div className="rounded-sm bg-background/80 p-1">
                                                        <Checkbox checked={isSelected} onCheckedChange={() => handleToggleAsset(asset.id)} />
                                                    </div>
                                                </div>

                                                {/* Preview */}
                                                <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-lg bg-muted">
                                                    {asset.type === 'image' && asset.publicUrl ? (
                                                        <img src={asset.publicUrl} alt={asset.fileName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        getTypeIcon()
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="p-3 space-y-2">
                                                    <h4 className="line-clamp-1 text-sm font-medium" title={asset.fileName}>
                                                        {asset.fileName}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {asset.locale && (
                                                            <Badge variant="outline" className="uppercase text-xs">
                                                                {asset.locale}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="secondary" className="text-xs">
                                                            {formatFileSize(asset.fileSize)}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 mt-4">
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="rounded-full bg-muted p-6">
                                        <Upload className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Upload {type}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {locale && `For ${locale.toUpperCase()} locale`}
                                    </p>
                                    <Button onClick={handleUploadClick}>
                                        <Upload />
                                        Mock Upload {type}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selected.size > 0 && t('selected', { count: selected.size })}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleSelect} disabled={selected.size === 0}>
                            {t('select')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
