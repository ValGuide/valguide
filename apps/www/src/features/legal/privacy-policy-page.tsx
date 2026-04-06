import { useTranslations } from '@valguide/core/i18n/client'
import { LegalPageShell } from './legal-page-shell'

export function PrivacyPolicyPage() {
  const t = useTranslations('www.legal')
  // i18n-used-keys: www.legal.privacyPolicy.title, www.legal.privacyPolicy.body, www.legal.termsOfService.title

  return (
    <LegalPageShell
      currentPath="/privacy-policy"
      title={t('privacyPolicy.title')}
      body={t('privacyPolicy.body')}
      policiesLabel={t('policies.title')}
      privacyLabel={t('privacyPolicy.title')}
      termsLabel={t('termsOfService.title')}
      cookieLabel={t('cookiePolicy.title')}
    />
  )
}
