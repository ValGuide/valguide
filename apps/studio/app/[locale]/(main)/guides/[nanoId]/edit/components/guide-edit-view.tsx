'use client'

import { PublishTranslationButton } from '@valguide/core/features/guides/components/publish-translation-button'
import { VersionHistoryDialog } from '@valguide/core/features/guides/components/version-history-dialog'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { Link, usePathname, useRouter } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@valguide/ui/components/sheet'
import { ChevronRight, ListChecks } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GuideMetadataForm } from '@/features/guides/components/guide-metadata-form'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { StopsList } from '@/features/guides/components/stops-list'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

export function GuideEditView() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    guide,
    activeLocale,
    isDirty,
    isSaving,
    updateGuideTranslationData,
    updateCoverImage,
    addStop,
    deleteStop,
    reorderStops,
    setActiveLocale,
    save,
  } = useGuideEditor()

  const guideDetailUrl = `/guides/${guide.nanoId}`

  const guideTitle =
    guide.translations.find((t) => t.currentVersion?.title)?.currentVersion?.title ??
    guide.translations.find((t) => t.draftVersion?.title)?.draftVersion?.title ??
    t('untitledGuide')

  const { data: sidebarData } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id ?? ''

  useAutoSave(save, isDirty)

  const currentTranslation = guide.translations.find((t) => t.locale === activeLocale)

  const handleSelectStop = (stop: StopWithTranslations | null) => {
    if (stop) {
      router.replace(`${pathname}?stop=${stop.id}`)
    }
  }

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    const reordered = [...guide.stops]
    updates.forEach(({ id, order }) => {
      const stopToUpdate = reordered.find((s) => s.id === id)
      if (stopToUpdate) stopToUpdate.order = order
    })
    reorderStops(reordered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
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
          <span className="font-medium text-foreground">{t('editor.edit')}</span>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <VersionHistoryDialog
            guideId={guide.id}
            locale={activeLocale}
            onRollback={() => {
              router.refresh()
            }}
          />
          <PublishTranslationButton
            guideId={guide.id}
            locale={activeLocale}
            hasDraft={!!currentTranslation?.draftVersionId}
            onPublished={() => {
              router.refresh()
            }}
          />
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            {t('editor.preview')}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 lg:hidden">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">{t('editor.progress')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6 sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>{t('editor.guideProgress')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <GuideProgress guide={guide} locale={activeLocale} />
              </div>
            </SheetContent>
          </Sheet>
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
              <div>
                <h2 className="mb-4 text-lg font-semibold">{t('editor.guideDetails')}</h2>
                <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />
              </div>

              <GuideMetadataForm
                locale={activeLocale}
                translation={currentTranslation}
                coverImage={guide.coverImage}
                organizationId={organizationId}
                onTranslationChange={(data) => {
                  updateGuideTranslationData(activeLocale, data)
                }}
                onCoverImageChange={(url) => {
                  updateCoverImage(url)
                }}
              />

              <div>
                <h3 className="mb-4 text-base font-medium">{tStops('title')}</h3>
                <StopsList
                  stops={guide.stops}
                  locale={activeLocale}
                  selectedStopId={undefined}
                  onReorder={handleReorderStops}
                  onEdit={handleSelectStop}
                  onDelete={deleteStop}
                  onAdd={async () => {
                    const newStop = await addStop()
                    if (newStop) {
                      router.replace(`${pathname}?stop=${newStop.id}`)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
          <h3 className="mb-4 text-base font-semibold">{t('editor.guideProgress')}</h3>
          <GuideProgress guide={guide} locale={activeLocale} />
        </div>
      </div>
    </div>
  )
}
