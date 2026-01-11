import { publishGuideTranslationDraftFn } from '../server-functions'
import { PublishTranslationButton } from './publish-translation-button'

type PublishTranslationButtonConnectedProps = Omit<Parameters<typeof PublishTranslationButton>[0], 'onPublishAction'>

export function PublishTranslationButtonConnected(props: PublishTranslationButtonConnectedProps) {
  return (
    <PublishTranslationButton
      {...props}
      onPublishAction={async (guideId, locale) => {
        return publishGuideTranslationDraftFn({ data: { guideId, locale } })
      }}
    />
  )
}
