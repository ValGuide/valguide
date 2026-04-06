import { useQueryClient } from '@tanstack/react-query'
import { archiveTourFn } from '@valguide/core/features/tours/tour/archive-tour.fn'
import { Button } from '@valguide/ui/components/button'
import { Archive } from 'lucide-react'
import { useState } from 'react'
import { ArchiveTourDialog } from './archive-tour-dialog'

interface ArchiveTourButtonProps {
  tourNanoId: string
  onArchived: () => void
}

export function ArchiveTourButton({ tourNanoId, onArchived }: ArchiveTourButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const queryClient = useQueryClient()

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      await archiveTourFn({ data: { nanoId: tourNanoId } })
      // Invalidate both lists so navigation shows updated data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tours'] }),
        queryClient.invalidateQueries({ queryKey: ['archived-tours'] }),
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
        <span className="hidden sm:inline">Archive</span>
      </Button>
      <ArchiveTourDialog open={isOpen} onOpenChange={setIsOpen} isArchiving={isArchiving} onConfirm={handleArchive} />
    </>
  )
}
