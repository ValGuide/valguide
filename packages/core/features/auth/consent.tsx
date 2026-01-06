import { Link } from '@valguide/i18n/routing'
import { FieldDescription } from '@valguide/ui/components/field'
import { useTranslations } from '@valguide/core/i18n/mock'

export const Consent = () => {
  const commonT = useTranslations('common')
  return (
    <FieldDescription className="text-center">
      {commonT.rich('consentMessage', {
        termsLink: (chunks) => (
          <Link href="/terms-of-service" className="hover:underline">
            {chunks}
          </Link>
        ),
        privacyLink: (chunks) => (
          <Link href="/privacy-policy" className="hover:underline">
            {chunks}
          </Link>
        ),
      })}
    </FieldDescription>
  )
}
