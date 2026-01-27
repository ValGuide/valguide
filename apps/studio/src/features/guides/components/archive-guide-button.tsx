import { useQueryClient } from '@tanstack/react-query'
import { archiveGuideFn } from '@valguide/core/features/guides/guide/archive-guide.fn'
import { Button } from '@valguide/ui/components/button'
import { Archive } from 'lucide-react'
import { useState } from 'react'
import { ArchiveGuideDialog } from './archive-guide-dialog'

interface ArchiveGuideButtonProps {
  guideNanoId: string
  onArchived: () => void
}

export function ArchiveGuideButton({ guideNanoId, onArchived }: ArchiveGuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const queryClient = useQueryClient()

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      await archiveGuideFn({ data: { nanoId: guideNanoId } })
      // Invalidate both lists so navigation shows updated data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['guides'] }),
        queryClient.invalidateQueries({ queryKey: ['archived-guides'] }),
      ])
      setIsOpen(false)
      onArchived()
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Archive className="h-4 w-4" />
        Archive
      </Button>
      <ArchiveGuideDialog open={isOpen} onOpenChange={setIsOpen} isArchiving={isArchiving} onConfirm={handleArchive} />
    </>
  )
}
