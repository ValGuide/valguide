import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { type ReactNode, useCallback, useState } from 'react'
import { type TourIndicator, type TourStatus, TourStatusBadge } from '@/features/tours/components/tour-status-badge'
import { DiscardConfirmationDialog } from './discard-confirmation-dialog'
import { DraftPublishedTabs, type EditorTab } from './draft-published-tabs'
import { EditorActionsPanel } from './editor-actions-panel'
import { EditorHeader } from './editor-header'
import { LocaleSelector } from './locale-selector'
import { MobileMoreMenu, MobileSavePublish } from './mobile-action-bar'
import { PublishConfirmationDialog } from './publish-confirmation-dialog'
import { UnpublishConfirmationDialog } from './unpublish-confirmation-dialog'

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

  /** Message to show when publishing is disabled */
  publishingDisabledMessage?: string

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

  /** Currently active tab (draft/published) */
  activeTab: EditorTab

  /** Tab change handler - receives new tab, should handle dirty confirmation */
  onTabChange: (tab: EditorTab) => void

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

  /** Desktop sidebar content (TourProgress for tours, null for stops) */
  sidebar?: ReactNode

  /** Mobile header extra actions (e.g., sheet trigger for progress) */
  mobileHeaderExtra?: ReactNode

  /** Main content area */
  children: ReactNode

  /** Optional unsaved changes confirmation dialog (rendered by parent) */
  unsavedChangesDialog?: ReactNode
}

export function BaseEditLayout({
  title,
  status,
  hasDraft,
  hasPublished,
  contentType,
  publishingDisabled,
  publishingDisabledMessage,
  activeLocale,
  availableLocales,
  onLocaleChange,
  localeSelectorFooter,
  isDirty,
  isSaving,
  isPublishing,
  activeTab,
  onTabChange,
  onSave,
  onPublish,
  onUnpublish,
  onDiscard,
  breadcrumbContent,
  backLabel,
  onBack,
  sidebar,
  mobileHeaderExtra,
  children,
  unsavedChangesDialog,
}: BaseEditLayoutProps) {
  const t = useTranslations('tours')

  // Dialog states
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  const isReadOnly = activeTab === 'published'
  const showChangedHelper = status.status === 'published' && status.indicator === 'changed'

  const handlePublishClick = useCallback(() => setPublishDialogOpen(true), [])
  const handleUnpublishClick = useCallback(() => setUnpublishDialogOpen(true), [])
  const handleDiscardClick = useCallback(() => setDiscardDialogOpen(true), [])

  return (
    <>
      {unsavedChangesDialog}

      <div className="bg-background pb-16 sm:pb-0">
        {/* Mobile/Tablet Header */}
        <div className="sticky top-0 z-10 border-b bg-background lg:hidden">
          {/* Row 1: Back/breadcrumb left, actions right */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
            {breadcrumbContent ?? (
              <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 shrink-0">
                <ChevronLeft className="h-4 w-4" />
                <span>{backLabel}</span>
              </Button>
            )}

            <div className="flex shrink-0 items-center gap-2">
              <LocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={onLocaleChange}
                footer={localeSelectorFooter}
              />
              <MobileMoreMenu
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                onUnpublishClick={handleUnpublishClick}
                onDiscardClick={handleDiscardClick}
                publishingDisabled={publishingDisabled}
              />
              {mobileHeaderExtra}
            </div>
          </div>

          {/* Row 2: Title + Status Badge */}
          <div className="flex flex-col gap-1 px-4 pb-3 sm:px-6">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 truncate text-lg font-semibold">{title}</h1>
              <TourStatusBadge status={status.status} indicator={status.indicator} size="sm" className="shrink-0" />
            </div>
            {showChangedHelper && <p className="text-xs text-muted-foreground">{t('helper.changedExplanation')}</p>}
          </div>

          {/* Row 3: Draft/Published tabs */}
          <div className="px-4 pb-3 sm:px-6">
            <DraftPublishedTabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              hasDraft={hasDraft}
              hasPublished={hasPublished}
            />
          </div>
        </div>

        {/* Desktop Header */}
        {breadcrumbContent ? (
          <EditorHeader
            backContent={breadcrumbContent}
            className="hidden lg:flex"
            actions={
              <LocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={onLocaleChange}
                footer={localeSelectorFooter}
              />
            }
          />
        ) : (
          <EditorHeader
            backLabel={backLabel ?? ''}
            onBack={onBack ?? (() => {})}
            className="hidden lg:flex"
            actions={
              <LocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={onLocaleChange}
                footer={localeSelectorFooter}
              />
            }
          />
        )}

        {/* Desktop: Status Badge and Tabs */}
        <div className="sticky top-14 z-10 hidden border-b bg-background px-4 py-3 sm:px-6 lg:block">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{title}</h1>
                <TourStatusBadge status={status.status} indicator={status.indicator} size="lg" className="shrink-0" />
              </div>
              {showChangedHelper && <p className="text-sm text-muted-foreground">{t('helper.changedExplanation')}</p>}
            </div>
            <DraftPublishedTabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              hasDraft={hasDraft}
              hasPublished={hasPublished}
            />
          </div>
        </div>

        {/* Mobile Save/Publish - fixed bottom bar */}
        <div className="lg:hidden">
          <MobileSavePublish
            hasDraft={hasDraft}
            isDirty={isDirty}
            isSaving={isSaving}
            isPublishing={isPublishing}
            onSave={onSave}
            onPublishClick={handlePublishClick}
            disabled={isReadOnly}
            publishingDisabled={publishingDisabled}
          />
        </div>

        {/* Main Content */}
        <div className="flex min-w-0">
          <div className="min-w-0 flex-1 bg-muted/30 dark:bg-background">
            <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
          </div>

          {/* Right Sidebar - Actions Panel (Desktop only) */}
          <aside className="sticky top-35 hidden w-72 shrink-0 self-start border-l bg-background lg:block">
            <div className="space-y-6 p-5">
              <EditorActionsPanel
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                isDirty={isDirty}
                isSaving={isSaving}
                isPublishing={isPublishing}
                onSave={onSave}
                onPublishClick={handlePublishClick}
                onUnpublishClick={handleUnpublishClick}
                onDiscardClick={handleDiscardClick}
                onOpenVersionHistory={() => {}}
                disabled={isReadOnly}
                publishingDisabled={publishingDisabled}
                publishingDisabledMessage={publishingDisabledMessage}
              />

              {sidebar && <div className="border-t pt-5">{sidebar}</div>}
            </div>
          </aside>
        </div>
      </div>

      <PublishConfirmationDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        isPublishing={isPublishing}
        onConfirm={onPublish}
      />

      <UnpublishConfirmationDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
        contentType={contentType}
        onConfirm={onUnpublish}
      />

      <DiscardConfirmationDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen} onConfirm={onDiscard} />
    </>
  )
}
