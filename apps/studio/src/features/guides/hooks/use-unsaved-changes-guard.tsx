import { useBlocker } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { UnsavedChangesDialog } from './unsaved-changes-dialog'

interface UseUnsavedChangesGuardOptions {
  isDirty: boolean
}

export function useUnsavedChangesGuard({ isDirty }: UseUnsavedChangesGuardOptions) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)

  // Use TanStack Router's useBlocker for router-level navigation blocking
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: isDirty,
    withResolver: true,
  })

  // For programmatic navigation (e.g., back buttons that use confirmIfDirty)
  const confirmIfDirty = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action()
        return
      }
      setPendingAction(() => action)
      setManualDialogOpen(true)
    },
    [isDirty],
  )

  const isBlocked = status === 'blocked'

  const dialog = (
    <>
      {/* Router-level navigation blocking dialog */}
      <UnsavedChangesDialog
        open={isBlocked}
        onOpenChange={(open) => !open && reset?.()}
        onStay={() => reset?.()}
        onLeave={() => proceed?.()}
      />

      {/* Manual confirmation dialog (for programmatic navigation via confirmIfDirty) */}
      <UnsavedChangesDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        onStay={() => setManualDialogOpen(false)}
        onLeave={() => {
          const action = pendingAction
          setManualDialogOpen(false)
          setPendingAction(null)
          action?.()
        }}
      />
    </>
  )

  return { confirmIfDirty, dialog }
}
