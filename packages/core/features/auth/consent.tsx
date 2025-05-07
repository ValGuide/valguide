import { Link } from '@valguide/i18n/routing'
import { useTranslations } from 'next-intl'

export const Consent = () => {
  const commonT = useTranslations('common')
  return (
    <div className="sticky bottom-0 w-full py-4 border-t mt-auto">
      <div className="text-sm text-gray-600 text-center max-w-md mx-auto">
        {commonT.rich('consentMessage', {
          termsLink: (chunks) => (
            <Link href="/terms-of-service" className="text-blue-600 hover:underline">
              {chunks}
            </Link>
          ),
          privacyLink: (chunks) => (
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </div>
    </div>
  )
}
