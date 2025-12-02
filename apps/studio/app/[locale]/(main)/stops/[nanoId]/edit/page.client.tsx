'use client'

import { updateStop } from '@valguide/core/features/guides/actions'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Link, useRouter } from '@valguide/i18n/routing'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@valguide/ui/components/breadcrumb'
import { Button } from '@valguide/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { StopEditor } from '@/features/guides/components/stop-editor'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

interface StandaloneStopEditorClientProps {
  fallbackStop: StopWithTranslations
}

export function StandaloneStopEditorClient({ fallbackStop }: StandaloneStopEditorClientProps) {
  const router = useRouter()
  const t = useTranslations('stops')
  const tCommon = useTranslations('common')
  const { data: sidebarData } = useSidebarData()

  const [stop, setStop] = useState<StopWithTranslations>(fallbackStop)
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('de')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const modifiedLocalesRef = useRef<Set<string>>(new Set())
  const stopRef = useRef(stop)
  const isDirtyRef = useRef(isDirty)
  stopRef.current = stop
  isDirtyRef.current = isDirty

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const organizationId = sidebarData?.currentTeam?.id ?? ''

  const currentTranslation = stop.translations.find((t) => t.locale === activeLocale)
  const stopTitle = getVersionedField(currentTranslation, 'title') || t('untitled')

  const handleBack = () => {
    confirmIfDirty(() => router.push('/stops'))
  }

  const handleStopChange = useCallback(
    (data: { title: string; description: string; transcription: string }) => {
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
      setIsDirty(true)
    },
    [activeLocale],
  )

  const save = useCallback(async () => {
    if (!isDirtyRef.current) return

    setIsSaving(true)
    try {
      const currentStop = stopRef.current
      const modifiedLocales = modifiedLocalesRef.current

      for (const localeKey of modifiedLocales) {
        const translation = currentStop.translations.find((t) => t.locale === localeKey)
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
      setIsDirty(false)
      toast.success(tCommon('saved'))
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error(tCommon('saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [tCommon])

  useAutoSave(save, isDirty)

  return (
    <>
      {unsavedChangesDialog}
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
        {/* Header */}
        <div className="border-b bg-background px-3 py-3 sm:px-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Breadcrumb className="hidden min-w-0 flex-1 lg:flex">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/stops">{t('title')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="block max-w-[200px] truncate">{stopTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1 sm:gap-2">
              <Button onClick={save} disabled={isSaving || !isDirty} size="sm">
                {isSaving ? tCommon('saving') : tCommon('save')}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
            <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToStops')}
                </Button>

                <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />

                <StopEditor
                  key={`${stop.id}-${activeLocale}`}
                  stop={stop}
                  locale={activeLocale}
                  organizationId={organizationId}
                  onChange={handleStopChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
