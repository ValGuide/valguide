import { deleteGuideFn, recoverGuideFn } from '@valguide/core/features/guides/guide/server-functions'
import { ArchivedGuidesList, type ArchivedGuidesListProps } from './archived-guides-list'

type ArchivedGuidesListConnectedProps = Omit<ArchivedGuidesListProps, 'onRecover' | 'onDelete'>

export function ArchivedGuidesListConnected(props: ArchivedGuidesListConnectedProps) {
  return (
    <ArchivedGuidesList
      {...props}
      onRecover={async (guideId) => {
        await recoverGuideFn({ data: { id: guideId } })
      }}
      onDelete={async (guideId) => {
        await deleteGuideFn({ data: { id: guideId } })
      }}
    />
  )
}
