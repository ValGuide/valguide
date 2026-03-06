import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { formatFileSize } from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@valguide/ui/components/accordion'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { Input } from '@valguide/ui/components/input'
import { RevealImage } from '@valguide/ui/components/reveal-image'
import { format } from 'date-fns'
import { Clipboard, Music, Video } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { AssetVideoThumbnail } from './asset-video-thumbnail'

type AssetDetailsDrawerProps = {
  asset: AssetWithUsage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename: (assetId: string, fileName: string) => Promise<void>
}

export function AssetDetailsDrawer({ asset, open, onOpenChange, onRename }: AssetDetailsDrawerProps) {
  const t = useTranslations('assets')
  const isMobile = useIsMobile()
  const [draftName, setDraftName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDraftName(asset?.fileName ?? '')
    setIsSaving(false)
  }, [asset?.id, asset?.fileName, open])

  const hasChanges = useMemo(() => {
    if (!asset) return false
    return draftName.trim() !== asset.fileName
  }, [asset, draftName])

  const canSave = Boolean(asset && draftName.trim().length > 0 && hasChanges && !isSaving)

  const totalUsage = (asset?.tourCount ?? 0) + (asset?.stopCount ?? 0)

  const usageSummary =
    totalUsage === 0
      ? t('usage.unused')
      : t('usage.summaryTotal', {
          count: totalUsage,
        })

  const handleSaveRename = async () => {
    if (!asset || !canSave) {
      return
    }

    try {
      setIsSaving(true)
      const nextName = draftName.trim()
      await onRename(asset.id, nextName)
      setDraftName(nextName)
      toast.success(t('details.renameSuccess'))
    } catch (error) {
      console.error('Failed to rename asset:', error)
      toast.error(t('details.renameError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyNanoId = async () => {
    if (!asset) {
      return
    }

    try {
      await navigator.clipboard.writeText(asset.nanoId)
      toast.success(t('details.copyIdSuccess'))
    } catch (error) {
      console.error('Failed to copy asset ID:', error)
      toast.error(t('details.copyIdError'))
    }
  }

  const createdAtValue = asset ? format(new Date(asset.createdAt), 'PPp') : '-'
  const updatedAtValue = asset ? format(new Date(asset.updatedAt), 'PPp') : '-'

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? 'bottom' : 'right'}>
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg">
        {asset ? (
          <>
            <DrawerHeader className="border-b text-left">
              <DrawerTitle>{t('details.title')}</DrawerTitle>
              <DrawerDescription>{asset.fileName}</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 overflow-y-auto p-4">
              <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {asset.type === 'image' ? (
                  <RevealImage
                    src={getAssetImageUrl(asset)}
                    alt={asset.fileName}
                    layout="constrained"
                    width={640}
                    height={256}
                  />
                ) : asset.type === 'video' ? (
                  <AssetVideoThumbnail storagePath={asset.storagePath} alt={asset.fileName} width={640} height={256} />
                ) : asset.type === 'audio' ? (
                  <Music className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <Video className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="asset-name" className="text-sm font-medium">
                  {t('details.nameLabel')}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="asset-name"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder={t('details.namePlaceholder')}
                  />
                  <Button type="button" onClick={() => void handleSaveRename()} disabled={!canSave}>
                    {isSaving ? t('details.saving') : t('details.save')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{t('details.usageLabel')}</div>
                  <div className="mt-1 text-sm font-medium">{usageSummary}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t('details.usageBreakdown', {
                      tours: asset.tourCount,
                      stops: asset.stopCount,
                    })}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{t('details.typeLabel')}</div>
                  <div className="mt-1">
                    <Badge variant="secondary">{t(`types.${asset.type}`)}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{t('details.idLabel')}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void handleCopyNanoId()}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    {t('details.copyId')}
                  </Button>
                </div>
                <p className="truncate font-mono text-xs text-muted-foreground">{asset.nanoId}</p>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="more-details">
                  <AccordionTrigger>{t('details.moreDetails')}</AccordionTrigger>
                  <AccordionContent>
                    <dl className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">{t('details.fileSize')}</dt>
                        <dd>{formatFileSize(asset.fileSize)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">{t('details.mimeType')}</dt>
                        <dd className="font-mono text-xs">{asset.mimeType}</dd>
                      </div>
                      {asset.duration ? (
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">{t('details.duration')}</dt>
                          <dd>{t('details.durationSeconds', { count: asset.duration })}</dd>
                        </div>
                      ) : null}
                      {asset.width && asset.height ? (
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">{t('details.dimensions')}</dt>
                          <dd>{t('details.pixels', { width: asset.width, height: asset.height })}</dd>
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">{t('details.createdAt')}</dt>
                        <dd>{createdAtValue}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">{t('details.updatedAt')}</dt>
                        <dd>{updatedAtValue}</dd>
                      </div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
