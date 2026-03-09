import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { ChevronLeft, MoreHorizontal, Trash2, X } from 'lucide-react'
import { lazy, type ReactNode, Suspense, useCallback, useState } from 'react'
import type { TourIndicator, TourStatus } from '@/features/tours/components/tour-status-badge'
import { EditorHeader } from './editor-header'
import { getLocaleDisplayName, LocaleSelector } from './locale-selector'
import { MobileSavePublish } from './mobile-action-bar'

const DiscardConfirmationDialog = lazy(async () => {
  const module = await import('./discard-confirmation-dialog')
  return { default: module.DiscardConfirmationDialog }
})

const PublishConfirmationDialog = lazy(async () => {
  const module = await import('./publish-confirmation-dialog')
  return { default: module.PublishConfirmationDialog }
})

const UnpublishConfirmationDialog = lazy(async () => {
  const module = await import('./unpublish-confirmation-dialog')
  return { default: module.UnpublishConfirmationDialog }
})

export type StatusDisplay = {
  status: TourStatus
  indicator: TourIndicator
}

export interface BaseEditLayoutProps {
  /** Entity title to display in header */
  title: string

  /** Status badge display config */
  status: StatusDisplay

  /** Whether draft version exists */
  hasDraft: boolean

  /** Whether published version exists */
  hasPublished: boolean

  /** Content type for unpublish dialog messaging */
  contentType: 'tour' | 'stop'

  /** Hide publish/unpublish actions (e.g., for stops in tour context) */
  publishingDisabled?: boolean

  /** Currently active locale */
  activeLocale: string

  /** Available locales for selection */
  availableLocales: string[]

  /** Locale change handler */
  onLocaleChange: (locale: string) => void

  /** Footer content for locale selector (e.g., "Manage Translations" link) */
  localeSelectorFooter?: ReactNode

  /** Whether there are unsaved changes */
  isDirty: boolean

  /** Whether save is in progress */
  isSaving: boolean

  /** Whether publish is in progress */
  isPublishing: boolean

  /** Save action */
  onSave: () => Promise<void>

  /** Publish action - called after confirmation dialog */
  onPublish: () => Promise<void>

  /** Unpublish action - called after confirmation dialog */
  onUnpublish: () => Promise<void>

  /** Discard action - called after confirmation dialog */
  onDiscard: () => Promise<void>

  /** Back button/breadcrumb content for header (use for stop editor with tour context) */
  breadcrumbContent?: ReactNode

  /** Simple back button label (use for tour editor) */
  backLabel?: string

  /** Simple back button handler */
  onBack?: () => void

  /** Main content area */
  children: ReactNode

  /** Optional unsaved changes confirmation dialog (rendered by parent) */
  unsavedChangesDialog?: ReactNode
}

function MoreActionsMenu({
  canUnpublish,
  canDiscard,
  onUnpublishClick,
  onDiscardClick,
}: {
  canUnpublish: boolean
  canDiscard: boolean
  onUnpublishClick: () => void
  onDiscardClick: () => void
}) {
  const t = useTranslations('tours')

  if (!canUnpublish && !canDiscard) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('actions.moreActions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {canUnpublish && (
          <DropdownMenuItem onClick={onUnpublishClick} className="text-destructive focus:text-destructive">
            <X className="mr-2 h-4 w-4" />
            {t('actions.unpublish')}
          </DropdownMenuItem>
        )}
        {canDiscard && (
          <DropdownMenuItem onClick={onDiscardClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('actions.discardChanges')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SavePublishButtons({
  hasDraft,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublishClick,
  publishingDisabled,
}: {
  hasDraft: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  onSave: () => void
  onPublishClick: () => void
  publishingDisabled?: boolean
}) {
  const t = useTranslations('tours')

  return (
    <>
      <Button variant="outline" onClick={onSave} disabled={!isDirty || isSaving || isPublishing} size="sm">
        {isSaving && !isPublishing ? t('actions.saving') : t('actions.save')}
      </Button>
      {!publishingDisabled && (
        <Button onClick={onPublishClick} disabled={!(hasDraft || isDirty) || isPublishing || isSaving} size="sm">
          {isPublishing ? t('actions.publishing') : t('actions.publish')}
        </Button>
      )}
    </>
  )
}

export function BaseEditLayout({
  title,
  status,
  hasDraft,
  hasPublished,
  contentType,
  publishingDisabled,
  activeLocale,
  availableLocales,
  onLocaleChange,
  localeSelectorFooter,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  onUnpublish,
  onDiscard,
  breadcrumbContent,
  backLabel,
  onBack,
  children,
  unsavedChangesDialog,
}: BaseEditLayoutProps) {
  const t = useTranslations('tours')

  // Dialog states
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  const showChangedHelper = status.status === 'published' && status.indicator === 'changed'
  const canUnpublish = hasPublished && !publishingDisabled
  const canDiscard = hasDraft && hasPublished

  const handlePublishClick = useCallback(() => setPublishDialogOpen(true), [])
  const handleUnpublishClick = useCallback(() => setUnpublishDialogOpen(true), [])
  const handleDiscardClick = useCallback(() => setDiscardDialogOpen(true), [])

  const headerActions = (
    <div className="flex items-center gap-2">
      <MoreActionsMenu
        canUnpublish={canUnpublish}
        canDiscard={canDiscard}
        onUnpublishClick={handleUnpublishClick}
        onDiscardClick={handleDiscardClick}
      />
      <LocaleSelector
        value={activeLocale}
        locales={availableLocales}
        onValueChange={onLocaleChange}
        footer={localeSelectorFooter}
      />
      <SavePublishButtons
        hasDraft={hasDraft}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSave={onSave}
        onPublishClick={handlePublishClick}
        publishingDisabled={publishingDisabled}
      />
    </div>
  )

  return (
    <>
      {unsavedChangesDialog}

      <div className="bg-background pb-16 sm:pb-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
          {/* Row 1: Back/breadcrumb left, actions right */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            {breadcrumbContent ?? (
              <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 shrink-0">
                <ChevronLeft className="h-4 w-4" />
                <span>{backLabel}</span>
              </Button>
            )}

            <div className="flex shrink-0 items-center gap-2">
              <MoreActionsMenu
                canUnpublish={canUnpublish}
                canDiscard={canDiscard}
                onUnpublishClick={handleUnpublishClick}
                onDiscardClick={handleDiscardClick}
              />
              <LocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={onLocaleChange}
                footer={localeSelectorFooter}
              />
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="flex flex-col gap-1 px-4 pb-3">
            <h1 className="min-w-0 truncate text-lg font-semibold">{title}</h1>
            {showChangedHelper && <p className="text-xs text-muted-foreground">{t('helper.changedExplanation')}</p>}
          </div>
        </div>

        {/* Tablet + Desktop Header */}
        {breadcrumbContent ? (
          <EditorHeader backContent={breadcrumbContent} className="hidden sm:flex" actions={headerActions} />
        ) : (
          <EditorHeader
            backLabel={backLabel ?? ''}
            onBack={onBack ?? (() => {})}
            className="hidden sm:flex"
            actions={headerActions}
          />
        )}

        {/* Tablet + Desktop: Title */}
        <div className="sticky top-14 z-10 hidden bg-background px-4 py-3 sm:block sm:px-6">
          <div className="flex flex-col gap-1">
            <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{title}</h1>
            {showChangedHelper && <p className="text-sm text-muted-foreground">{t('helper.changedExplanation')}</p>}
          </div>
        </div>

        {/* Mobile Save/Publish - fixed bottom bar */}
        <div className="sm:hidden">
          <MobileSavePublish
            hasDraft={hasDraft}
            isDirty={isDirty}
            isSaving={isSaving}
            isPublishing={isPublishing}
            onSave={onSave}
            onPublishClick={handlePublishClick}
            publishingDisabled={publishingDisabled}
          />
        </div>

        {/* Main Content */}
        <div className="bg-muted/30 dark:bg-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>

      {publishDialogOpen ? (
        <Suspense fallback={null}>
          <PublishConfirmationDialog
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
            isPublishing={isPublishing}
            onConfirm={onPublish}
            languageName={getLocaleDisplayName(activeLocale)}
          />
        </Suspense>
      ) : null}

      {unpublishDialogOpen ? (
        <Suspense fallback={null}>
          <UnpublishConfirmationDialog
            open={unpublishDialogOpen}
            onOpenChange={setUnpublishDialogOpen}
            contentType={contentType}
            languageName={getLocaleDisplayName(activeLocale)}
            onConfirm={onUnpublish}
          />
        </Suspense>
      ) : null}

      {discardDialogOpen ? (
        <Suspense fallback={null}>
          <DiscardConfirmationDialog
            open={discardDialogOpen}
            onOpenChange={setDiscardDialogOpen}
            onConfirm={onDiscard}
            contentType={contentType}
          />
        </Suspense>
      ) : null}
    </>
  )
}
