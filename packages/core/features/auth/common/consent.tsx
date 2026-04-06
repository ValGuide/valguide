import { clientEnv } from '@valguide/core/env/client'
import { useTranslations } from '@valguide/core/i18n/client'
import { FieldDescription } from '@valguide/ui/components/field'

export const Consent = () => {
  const commonT = useTranslations('common')
  return (
    <FieldDescription className="text-center">
      {commonT.rich('consentMessage', {
        termsLink: (chunks) => (
          <a
            href={clientEnv.VITE_TERMS_OF_SERVICE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            {chunks}
          </a>
        ),
        privacyLink: (chunks) => (
          <a
            href={clientEnv.VITE_PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            {chunks}
          </a>
        ),
      })}
    </FieldDescription>
  )
}
