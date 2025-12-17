'use client'

import {
  attachAssetToStop as attachAssetToStopAction,
  detachAssetFromStop as detachAssetFromStopAction,
  updateStop,
} from '@valguide/core/features/guides/actions'
import type { StopWithAssets } from '@valguide/core/features/guides/queries'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { Link, useRouter } from '@valguide/i18n/routing'
import { BreadcrumbItem, BreadcrumbLink } from '@valguide/ui/components/breadcrumb'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { StopEditLayout } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import type { StopTranslationFormData } from '@/features/guides/schemas/guide-form'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

interface StandaloneStopEditorClientProps {
  fallbackStop: StopWithAssets
  initialLocale?: string
}

export function StandaloneStopEditorClient({ fallbackStop, initialLocale }: StandaloneStopEditorClientProps) {
  const router = useRouter()
  const tStops = useTranslations('stops')
  const tCommon = useTranslations('common')
  const { data: sidebarData } = useSidebarData()

  const [stop, setStop] = useState<StopWithAssets>(fallbackStop)
  const [activeLocale, setActiveLocale] = useState<string>(initialLocale ?? 'de')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const modifiedLocalesRef = useRef<Set<string>>(new Set())
  const stopRef = useRef(stop)
  const stopEditorRef = useRef<StopLocaleEditorRef>(null)
  stopRef.current = stop

  const organizationId = sidebarData?.currentTeam?.id ?? ''

  const currentTranslation = stop.translations.find((tr) => tr.locale === activeLocale)
  const stopTitle = getVersionedField(currentTranslation, 'title') || tStops('untitled')

  const stopImages = stop.assets.filter((a) => (a.role === 'image' || a.role === 'video') && a.locale === null)

  const handleBack = useCallback(() => {
    router.push('/stops')
  }, [router])

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  const handleStopChange = useCallback(
    (data: StopTranslationFormData) => {
      setStop((prev) => ({
        ...prev,
        translations: prev.translations.map((translation) => {
          if (translation.locale !== activeLocale) return translation

          const now = new Date()
          return {
            ...translation,
            draftVersion: translation.draftVersion
              ? { ...translation.draftVersion, ...data }
              : translation.currentVersion
                ? { ...translation.currentVersion, ...data, status: 'draft' as const }
                : {
                    id: `temp-version-${prev.id}-${activeLocale}`,
                    translationId: translation.id,
                    version: 1,
                    status: 'draft' as const,
                    title: data.title,
                    description: data.description,
                    transcription: data.transcription,
                    createdBy: null,
                    createdAt: now,
                    publishedAt: null,
                  },
          }
        }),
      }))
      modifiedLocalesRef.current.add(activeLocale)
    },
    [activeLocale],
  )

  const refetch = useCallback(() => {
    router.refresh()
  }, [router])

  const save = useCallback(async () => {
    if (!isDirty) return

    setIsSaving(true)
    try {
      const currentStop = stopRef.current
      const modifiedLocales = modifiedLocalesRef.current

      for (const localeKey of modifiedLocales) {
        const translation = currentStop.translations.find((tr) => tr.locale === localeKey)
        if (translation) {
          const version = translation.draftVersion ?? translation.currentVersion
          if (version) {
            await updateStop({
              stopId: currentStop.id,
              locale: translation.locale,
              title: version.title,
              description: version.description ?? '',
              transcription: version.transcription ?? '',
            })
          }
        }
      }

      modifiedLocalesRef.current.clear()
      stopEditorRef.current?.resetToCurrentValues()
      toast.success(tCommon('saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(tCommon('saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, tCommon])

  const attachAssetToStop = useCallback(
    async (asset: { id: string }, role: string, locale: string | null) => {
      try {
        const result = await attachAssetToStopAction({
          stopId: stop.id,
          assetId: asset.id,
          role,
          locale: locale ?? undefined,
        })
        if (!result) return
        setStop((prev) => ({
          ...prev,
          assets: [
            ...prev.assets,
            {
              id: asset.id,
              stopAssetId: result.id,
              role,
              order: prev.assets.length,
              locale,
            } as StopWithAssets['assets'][number],
          ],
        }))
      } catch (error) {
        console.error('Failed to attach asset:', error)
        toast.error(tCommon('error'))
      }
    },
    [stop.id, tCommon],
  )

  const detachAssetFromStop = useCallback(
    async (assetId: string, stopAssetId: string) => {
      try {
        await detachAssetFromStopAction(stopAssetId)
        setStop((prev) => ({
          ...prev,
          assets: prev.assets.filter((a) => a.id !== assetId),
        }))
      } catch (error) {
        console.error('Failed to detach asset:', error)
        toast.error(tCommon('error'))
      }
    },
    [tCommon],
  )

  const breadcrumbContent = (
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href="/stops">{tStops('title')}</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )

  return (
    <StopEditLayout
      stop={stop}
      activeLocale={activeLocale}
      isDirty={isDirty}
      isSaving={isSaving}
      organizationId={organizationId}
      stopTitle={stopTitle}
      onLocaleChange={setActiveLocale}
      onStopChange={handleStopChange}
      onDirtyChange={handleDirtyChange}
      onSave={save}
      onRefetch={refetch}
      onBack={handleBack}
      backLabel={tStops('backToStops')}
      stopEditorRef={stopEditorRef}
      breadcrumbContent={breadcrumbContent}
      onImageChange={async (assets) => {
        const newAssetIds = new Set(assets.map((a) => a.id))
        const currentAssetIds = new Set(stopImages.map((a) => a.id))

        for (const existing of stopImages) {
          if (!newAssetIds.has(existing.id) && existing.stopAssetId) {
            await detachAssetFromStop(existing.id, existing.stopAssetId)
          }
        }

        for (const asset of assets) {
          if (!currentAssetIds.has(asset.id)) {
            await attachAssetToStop(asset, 'image', null)
          }
        }
      }}
      onAudioChange={async (asset) => {
        if (asset) {
          await attachAssetToStop(asset, 'audio', activeLocale)
        }
      }}
    />
  )
}
