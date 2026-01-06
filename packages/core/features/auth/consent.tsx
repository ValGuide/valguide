import { Link } from '@tanstack/react-router'
import { FieldDescription } from '@valguide/ui/components/field'
import { useTranslations } from '@valguide/core/i18n/mock'

export const Consent = () => {
  const commonT = useTranslations('common')
  return (
    <FieldDescription className="text-center">
      {commonT.rich('consentMessage', {
        termsLink: (chunks) => (
          <Link to="/terms-of-service" className="hover:underline">
            {chunks}
          </Link>
        ),
        privacyLink: (chunks) => (
          <Link to="/privacy-policy" className="hover:underline">
            {chunks}
          </Link>
        ),
      })}
    </FieldDescription>
  )
}
