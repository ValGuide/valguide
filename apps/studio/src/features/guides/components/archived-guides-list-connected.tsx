import { deleteGuideFn } from '@valguide/core/features/guides/guide/delete-guide'
import { recoverGuideFn } from '@valguide/core/features/guides/guide/recover-guide'
import { ArchivedGuidesList, type ArchivedGuidesListProps } from './archived-guides-list'

type ArchivedGuidesListConnectedProps = Omit<ArchivedGuidesListProps, 'onRecover' | 'onDelete'>

export function ArchivedGuidesListConnected(props: ArchivedGuidesListConnectedProps) {
  return (
    <ArchivedGuidesList
      {...props}
      onRecover={async (nanoId) => {
        await recoverGuideFn({ data: { nanoId } })
      }}
      onDelete={async (nanoId) => {
        await deleteGuideFn({ data: { nanoId, permanent: true } })
      }}
    />
  )
}
