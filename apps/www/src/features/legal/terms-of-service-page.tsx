import { useTranslations } from '@valguide/core/i18n/client'
import { LegalPageShell } from './legal-page-shell'

export function TermsOfServicePage() {
  const t = useTranslations('www.legal')
  // i18n-used-keys: www.legal.privacyPolicy.title, www.legal.termsOfService.title, www.legal.termsOfService.body

  return (
    <LegalPageShell
      currentPath="/terms-of-service"
      title={t('termsOfService.title')}
      body={t('termsOfService.body')}
      policiesLabel={t('policies.title')}
      privacyLabel={t('privacyPolicy.title')}
      termsLabel={t('termsOfService.title')}
    />
  )
}
