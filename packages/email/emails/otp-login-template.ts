import { getOtpLoginCopy } from '../templates/copy'
import type { EmailLocale } from '../templates/locales'
import type { ResendTemplateConfig } from '../templates/types'

export function getOtpLoginConfig(locale: EmailLocale): ResendTemplateConfig {
  return {
    key: 'otp-login',
    locale,
    alias: `otp-login-${locale}`,
    name: `OTP Login (${locale.toUpperCase()})`,
    subject: getOtpLoginCopy(locale).subject,
    from: 'ValGuide <noreply@valguide.com>',
    variables: [
      { key: 'CODE', type: 'string', fallbackValue: '000000' },
      { key: 'MAX_VALID_MINUTES', type: 'number', fallbackValue: 60 },
    ],
  }
}

export function getOtpLoginText(locale: EmailLocale): string {
  const copy = getOtpLoginCopy(locale)
  return `${copy.heading}

{{{CODE}}}

${copy.expires('{{{MAX_VALID_MINUTES}}}')}

${copy.ignore}`
}
