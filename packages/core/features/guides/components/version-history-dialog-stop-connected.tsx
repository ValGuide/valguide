import { getStopTranslationHistoryFn, rollbackStopTranslationFn } from '../server-functions'
import { VersionHistoryDialogStop } from './version-history-dialog-stop'

type VersionHistoryDialogStopConnectedProps = Omit<
  Parameters<typeof VersionHistoryDialogStop>[0],
  'onGetHistory' | 'onRollbackAction'
>

export function VersionHistoryDialogStopConnected(props: VersionHistoryDialogStopConnectedProps) {
  return (
    <VersionHistoryDialogStop
      {...props}
      onGetHistory={async (stopId, locale) => {
        return getStopTranslationHistoryFn({ data: { stopId, locale } })
      }}
      onRollbackAction={async (stopId, locale, targetVersion) => {
        return rollbackStopTranslationFn({ data: { stopId, locale, targetVersion } })
      }}
    />
  )
}
