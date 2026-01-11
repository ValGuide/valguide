import { publishStopTranslationDraftFn } from '../server-functions'
import { PublishStopTranslationButton } from './publish-stop-translation-button'

type PublishStopTranslationButtonConnectedProps = Omit<
  Parameters<typeof PublishStopTranslationButton>[0],
  'onPublishAction'
>

export function PublishStopTranslationButtonConnected(props: PublishStopTranslationButtonConnectedProps) {
  return (
    <PublishStopTranslationButton
      {...props}
      onPublishAction={async (stopId, locale) => {
        return publishStopTranslationDraftFn({ data: { stopId, locale } })
      }}
    />
  )
}
