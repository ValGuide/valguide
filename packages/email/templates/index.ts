import React from 'react'
import { defaultEmailLocale, type EmailLocale, emailLocales } from './locales'
import { getOtpLoginConfig, getOtpLoginText, OtpLoginTemplate } from './otp-login'
import { getTeamInviteConfig, getTeamInviteText, TeamInviteTemplate } from './team-invite'
import type { EmailTemplateKey, ResendTemplate } from './types'

export { defaultEmailLocale, type EmailLocale, emailLocales, isEmailLocale } from './locales'
export type { ResendTemplate, ResendTemplateConfig, ResendTemplateVariable } from './types'

export const templates: ResendTemplate[] = emailLocales.flatMap((locale) => [
  {
    config: getOtpLoginConfig(locale),
    component: () => React.createElement(OtpLoginTemplate, { locale }),
    text: getOtpLoginText(locale),
  },
  {
    config: getTeamInviteConfig(locale),
    component: () => React.createElement(TeamInviteTemplate, { locale }),
    text: getTeamInviteText(locale),
  },
])

export function getTemplateSubject(templateKey: EmailTemplateKey, locale: EmailLocale): string {
  const localized = templates.find(
    (template) => template.config.key === templateKey && template.config.locale === locale,
  )
  if (localized) {
    return localized.config.subject
  }

  const fallback = templates.find(
    (template) => template.config.key === templateKey && template.config.locale === defaultEmailLocale,
  )
  if (fallback) {
    return fallback.config.subject
  }

  throw new Error(`No template subject found for ${templateKey}`)
}

export { OtpLoginTemplate, getOtpLoginConfig }
export { TeamInviteTemplate, getTeamInviteConfig }
