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
    from: 'ValGuide <noreply@valguide.com>',
    variables: [
      { key: 'STUDIO_URL', type: 'string', fallbackValue: 'https://studio.valguide.com' },
      { key: 'LOGO_URL', type: 'string', fallbackValue: '/static/demo-logo.png' },
    ],
  }
}

export function getAccountApprovedText(locale: EmailLocale): string {
  const copy = getAccountApprovedCopy(locale)
  return `${copy.heading}

${copy.body}

${copy.cta}: {{{STUDIO_URL}}}`
}
