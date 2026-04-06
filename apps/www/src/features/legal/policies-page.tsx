import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'

export function PoliciesPage() {
  const t = useTranslations('www.legal')
  // i18n-used-keys: www.legal.policies.title, www.legal.policies.introPrimary, www.legal.policies.introSecondary, www.legal.policies.dataProcessingAgreement, www.legal.privacyPolicy.title, www.legal.privacyPolicy.summary, www.legal.termsOfService.title, www.legal.termsOfService.summary, www.legal.cookiePolicy.title, www.legal.cookiePolicy.summary

  return (
    <main className="min-h-svh bg-background px-4 py-12 text-foreground sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t('policies.title')}
          </h1>
          <div className="mt-10 space-y-8 text-lg leading-9 text-foreground/90 sm:text-xl">
            <p>{t('policies.introPrimary')}</p>
            <p>{t('policies.introSecondary')}</p>
          </div>
        </div>

        <ul className="mt-10 list-disc space-y-4 pl-6 text-lg leading-8 marker:text-foreground">
          <li>
            <Link
              to="/terms-of-service"
              className="underline decoration-1 underline-offset-4 transition hover:text-foreground/70"
            >
              {t('termsOfService.title')}
            </Link>
            <p className="mt-1 text-base leading-7 text-muted-foreground">{t('termsOfService.summary')}</p>
          </li>
          <li>
            <Link
              to="/privacy-policy"
              className="underline decoration-1 underline-offset-4 transition hover:text-foreground/70"
            >
              {t('privacyPolicy.title')}
            </Link>
            <p className="mt-1 text-base leading-7 text-muted-foreground">{t('privacyPolicy.summary')}</p>
          </li>
          <li>
            <Link
              to="/cookie-policy"
              className="underline decoration-1 underline-offset-4 transition hover:text-foreground/70"
            >
              {t('cookiePolicy.title')}
            </Link>
            <p className="mt-1 text-base leading-7 text-muted-foreground">{t('cookiePolicy.summary')}</p>
          </li>
        </ul>

        <p className="mt-12 text-lg leading-8 text-foreground/90">{t('policies.dataProcessingAgreement')}</p>
      </div>
    </main>
  )
}
