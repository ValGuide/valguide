import { deleteTourFn } from '@valguide/core/features/tours/tour/delete-tour.fn'
import { recoverTourFn } from '@valguide/core/features/tours/tour/recover-tour.fn'
import { ArchivedToursList, type ArchivedToursListProps } from './archived-tours-list'

type ArchivedToursListConnectedProps = Omit<ArchivedToursListProps, 'onRecover' | 'onDelete'>

export function ArchivedToursListConnected(props: ArchivedToursListConnectedProps) {
  return (
    <ArchivedToursList
      {...props}
      onRecover={async (nanoId) => {
        await recoverTourFn({ data: { nanoId } })
      }}
      onDelete={async (nanoId) => {
        await deleteTourFn({ data: { nanoId, permanent: true } })
      }}
    />
  )
}
