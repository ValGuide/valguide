import { deleteGuideFn, recoverGuideFn } from '@valguide/core/features/guides/server-functions'
import { ArchivedGuidesList, type ArchivedGuidesListProps } from './archived-guides-list'

type ArchivedGuidesListConnectedProps = Omit<ArchivedGuidesListProps, 'onRecover' | 'onDelete'>

export function ArchivedGuidesListConnected(props: ArchivedGuidesListConnectedProps) {
  return (
    <ArchivedGuidesList
      {...props}
      onRecover={(guideId) => recoverGuideFn({ data: { id: guideId } })}
      onDelete={(guideId) => deleteGuideFn({ data: { id: guideId } })}
    />
  )
}
