import { useTranslations } from '@valguide/core/i18n/client'
import { LegalPageShell } from './legal-page-shell'

export function CookiePolicyPage() {
  const t = useTranslations('www.legal')
  // i18n-used-keys: www.legal.cookiePolicy.title, www.legal.cookiePolicy.body, www.legal.policies.title, www.legal.privacyPolicy.title, www.legal.termsOfService.title

  return (
    <LegalPageShell
      currentPath="/cookie-policy"
      title={t('cookiePolicy.title')}
      body={t('cookiePolicy.body')}
      policiesLabel={t('policies.title')}
      privacyLabel={t('privacyPolicy.title')}
      termsLabel={t('termsOfService.title')}
      cookieLabel={t('cookiePolicy.title')}
    />
  )
}
