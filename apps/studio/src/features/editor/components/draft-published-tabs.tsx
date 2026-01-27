import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import type { EditorTab } from '../types'

export type { EditorTab }

export interface DraftPublishedTabsProps {
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
  hasDraft: boolean
  hasPublished: boolean
  className?: string
}

export function DraftPublishedTabs({
  activeTab,
  onTabChange,
  hasDraft: _hasDraft,
  hasPublished,
  className,
}: DraftPublishedTabsProps) {
  void _hasDraft
  const t = useTranslations('guides.tabs')

  return (
    <div className={cn('flex', className)}>
      <button
        type="button"
        onClick={() => onTabChange('draft')}
        className={cn(
          'relative px-4 py-2 text-sm font-medium transition-colors',
          'hover:text-foreground',
          activeTab === 'draft' ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {t('draft')}
        {activeTab === 'draft' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
      </button>
      <button
        type="button"
        onClick={() => onTabChange('published')}
        disabled={!hasPublished}
        className={cn(
          'relative px-4 py-2 text-sm font-medium transition-colors',
          'hover:text-foreground',
          !hasPublished && 'cursor-not-allowed opacity-50',
          activeTab === 'published' ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {t('published')}
        {activeTab === 'published' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
      </button>
    </div>
  )
}
