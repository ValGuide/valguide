'use client'

import { PublishStopTranslationButton } from '@valguide/core/features/guides/components/publish-stop-translation-button'
import { VersionHistoryDialogStop } from '@valguide/core/features/guides/components/version-history-dialog-stop'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { Link, usePathname, useRouter } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { StopEditor } from '@/features/guides/components/stop-editor'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

interface StopEditViewProps {
  stop: StopWithTranslations
}

export function StopEditView({ stop }: StopEditViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    guide,
    activeLocale,
    isDirty,
    isSaving,
    updateStopTranslationData,
    attachAssetToStop,
    setActiveLocale,
    save,
  } = useGuideEditor()

  const guideDetailUrl = `/guides/${guide.nanoId}`

  const guideTitle =
    guide.translations.find((t) => t.currentVersion?.title)?.currentVersion?.title ??
    guide.translations.find((t) => t.draftVersion?.title)?.draftVersion?.title ??
    t('untitledGuide')

  const stopTitle =
    stop.translations.find((t) => t.locale === activeLocale)?.currentVersion?.title ??
    stop.translations.find((t) => t.locale === activeLocale)?.draftVersion?.title ??
    tStops('untitled')

  const { data: sidebarData } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id ?? ''

  useAutoSave(save, isDirty)

  const currentStopTranslation = stop.translations.find((t) => t.locale === activeLocale)

  const handleBackToGuide = () => {
    router.replace(pathname)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-3 py-3 sm:px-6">
        <nav className="hidden min-w-0 shrink items-center gap-1 text-sm text-muted-foreground lg:flex">
          <Link href="/guides" className="hover:text-foreground hover:underline">
            {t('title')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={guideDetailUrl} className="max-w-[200px] truncate hover:text-foreground hover:underline">
            {guideTitle}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <button type="button" onClick={handleBackToGuide} className="hover:text-foreground hover:underline">
            {t('breadcrumb.stops')}
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="max-w-[150px] truncate font-medium text-foreground">{stopTitle}</span>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <VersionHistoryDialogStop
            stopId={stop.id}
            locale={activeLocale}
            onRollback={() => {
              router.refresh()
            }}
          />
          <PublishStopTranslationButton
            stopId={stop.id}
            locale={activeLocale}
            hasDraft={!!currentStopTranslation?.draftVersionId}
            onPublished={() => {
              router.refresh()
            }}
          />
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            {t('editor.preview')}
          </Button>
          <Button onClick={save} disabled={isSaving || !isDirty} size="sm">
            {isSaving ? t('editor.saving') : t('editor.save')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <Button variant="ghost" size="sm" onClick={handleBackToGuide} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {t('editor.backToGuide')}
              </Button>

              <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />

              <StopEditor
                stop={stop}
                locale={activeLocale}
                organizationId={organizationId}
                onSave={(data) => {
                  updateStopTranslationData(stop.id, activeLocale, data)
                }}
                onCancel={handleBackToGuide}
                onImageChange={async (assets) => {
                  for (const asset of assets) {
                    await attachAssetToStop(stop.id, asset.id, 'image', activeLocale)
                  }
                }}
                onAudioChange={async (asset) => {
                  if (asset) {
                    await attachAssetToStop(stop.id, asset.id, 'audio', activeLocale)
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
          <h3 className="mb-4 text-base font-semibold">{t('editor.stopProgress')}</h3>
          {/* TODO: Add stop-specific progress */}
        </div>
      </div>
    </div>
  )
}
