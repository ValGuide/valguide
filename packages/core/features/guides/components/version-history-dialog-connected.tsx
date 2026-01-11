import { getGuideTranslationHistoryFn, rollbackGuideTranslationFn } from '../server-functions'
import { VersionHistoryDialog } from './version-history-dialog'

type VersionHistoryDialogConnectedProps = Omit<
  Parameters<typeof VersionHistoryDialog>[0],
  'onGetHistory' | 'onRollbackAction'
>

export function VersionHistoryDialogConnected(props: VersionHistoryDialogConnectedProps) {
  return (
    <VersionHistoryDialog
      {...props}
      onGetHistory={async (guideId, locale) => {
        return getGuideTranslationHistoryFn({ data: { guideId, locale } })
      }}
      onRollbackAction={async (guideId, locale, targetVersion) => {
        return rollbackGuideTranslationFn({ data: { guideId, locale, targetVersion } })
      }}
    />
  )
}
