import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/core/ui/lib/utils'
import { ChevronUp, Globe, Heart, Share } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import type { TranscriptSegment } from '../types'

interface TranscriptDrawerProps {
  transcript?: TranscriptSegment[]
  currentTime: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TranscriptDrawer({ transcript, currentTime, isOpen, onOpenChange }: TranscriptDrawerProps) {
  const t = useTranslations('player')

  const activeSegmentIndex =
    transcript?.findIndex((segment) => currentTime >= segment.startTime && currentTime < segment.endTime) ?? -1

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isOpen && activeSegmentIndex !== -1 && scrollRef.current) {
      const activeElement = scrollRef.current.children[activeSegmentIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeSegmentIndex, isOpen])

  return (
    <Drawer.Root shouldScaleBackground open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 pt-4 text-white/50 hover:text-white/80 transition-colors z-20"
        >
          <ChevronUp size={20} className="animate-bounce" />
          <span className="text-xs font-medium uppercase tracking-widest mt-1">{t('transcriptAndMore')}</span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-zinc-100 dark:bg-zinc-900 flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 outline-none z-50">
          {/* Handle */}
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-t-[32px] flex-shrink-0">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-6" />

            {/* Action Buttons */}
            <div className="flex justify-center gap-8 mb-6">
              <ActionButton icon={<Globe size={20} />} label={t('language')} />
              <ActionButton icon={<Heart size={20} />} label={t('save')} />
              <ActionButton icon={<Share size={20} />} label={t('share')} />
            </div>
            <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-2" ref={scrollRef}>
            <div className="max-w-md mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{t('transcript')}</h2>
              {transcript ? (
                <div className="space-y-4">
                  {transcript.map((segment, i) => (
                    <p
                      key={segment.id}
                      className={cn(
                        'text-lg leading-relaxed transition-colors duration-300',
                        i === activeSegmentIndex
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-zinc-500 dark:text-zinc-400',
                      )}
                    >
                      {segment.text}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 italic">{t('noTranscript')}</p>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
    >
      <div className="p-3 rounded-full bg-zinc-200 dark:bg-zinc-800">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
