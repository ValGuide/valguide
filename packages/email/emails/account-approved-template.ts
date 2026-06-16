import { env } from '../env'
import { getAccountApprovedCopy } from '../templates/copy'
import type { EmailLocale } from '../templates/locales'
import type { ResendTemplateConfig } from '../templates/types'

export function getAccountApprovedConfig(locale: EmailLocale): ResendTemplateConfig {
  const copy = getAccountApprovedCopy(locale)
  return {
    key: 'account-approved',
    locale,
    alias: `account-approved-${locale}`,
    name: `Account Approved (${locale.toUpperCase()})`,
    subject: copy.subject,
    from: env.EMAIL_FROM,
    variables: [
      { key: 'STUDIO_URL', type: 'string', fallbackValue: 'https://studio.valguide.com' },
      { key: 'LOGO_URL', type: 'string', fallbackValue: 'https://studio.valguide.com/icon.png' },
    ],
  }
}
