import { Resend } from 'resend'
import type { AccountApprovedEmailProps } from './emails/account-approved-email'
import { getAccountApprovedConfig, getAccountApprovedText } from './emails/account-approved-template'
import type { OtpLoginEmailProps } from './emails/otp-login-email'
import { getOtpLoginConfig, getOtpLoginText } from './emails/otp-login-template'
import type { TeamInviteEmailProps } from './emails/team-invite-email'
import { getTeamInviteConfig, getTeamInviteText } from './emails/team-invite-template'
import { env } from './env'
import { resendTemplateIds } from './template-ids'
import { defaultEmailLocale, type EmailLocale, isEmailLocale } from './templates/locales'

// Initialize Resend with API key from environment
// Don't throw if key is missing, we'll handle it in sendEmail
const resend = env.RESEND_SENDING_API_KEY ? new Resend(env.RESEND_SENDING_API_KEY) : null

// Configurable sender
const FROM_EMAIL = env.EMAIL_FROM

export type EmailTemplate =
  | { name: 'team-invite'; data: TeamInviteEmailProps }
  | { name: 'account-approved'; data: AccountApprovedEmailProps }
  | { name: 'otp-login'; data: OtpLoginEmailProps }

export interface SendEmailOptions {
  to: string
  locale?: EmailLocale
  subject?: string
  template: EmailTemplate
}

function normalizeLocale(locale: EmailLocale | string | undefined): EmailLocale {
  if (isEmailLocale(locale)) {
    return locale
  }
  return defaultEmailLocale
}

function resolveSubject(template: EmailTemplate, locale: EmailLocale, subjectOverride?: string): string {
  if (subjectOverride) {
    return subjectOverride
  }

  switch (template.name) {
    case 'otp-login':
      return getOtpLoginConfig(locale).subject
    case 'team-invite':
      return getTeamInviteConfig(locale).subject
    case 'account-approved':
      return getAccountApprovedConfig(locale).subject
    default:
      throw new Error(`Unknown template: ${(template as EmailTemplate).name}`)
  }
}

function resolveTemplateAlias(template: EmailTemplate, locale: EmailLocale): string {
  switch (template.name) {
    case 'otp-login':
      return getOtpLoginConfig(locale).alias
    case 'team-invite':
      return getTeamInviteConfig(locale).alias
    case 'account-approved':
      return getAccountApprovedConfig(locale).alias
    default:
      throw new Error(`Unknown template: ${(template as EmailTemplate).name}`)
  }
}

function resolveTemplateText(template: EmailTemplate, locale: EmailLocale): string {
  switch (template.name) {
    case 'otp-login':
      return getOtpLoginText(locale)
    case 'team-invite':
      return getTeamInviteText(locale)
    case 'account-approved':
      return getAccountApprovedText(locale)
    default:
      throw new Error(`Unknown template: ${(template as EmailTemplate).name}`)
  }
}

function resolveTemplateVariables(template: EmailTemplate): Record<string, string | number> {
  switch (template.name) {
    case 'otp-login':
      return {
        CODE: template.data.code,
        MAX_VALID_MINUTES: template.data.maxValidMinutes,
      }
    case 'team-invite':
      return {
        INVITE_LINK: template.data.inviteLink,
        TEAM_NAME: template.data.teamName,
        INVITER_NAME: template.data.inviterName,
      }
    case 'account-approved':
      return {
        STUDIO_URL: template.data.studioUrl,
        LOGO_URL: template.data.logoUrl,
      }
    default:
      throw new Error(`Unknown template: ${(template as EmailTemplate).name}`)
  }
}

export async function sendEmail({ to, locale, subject: subjectOverride, template }: SendEmailOptions) {
  const resolvedLocale = normalizeLocale(locale)
  const subject = resolveSubject(template, resolvedLocale, subjectOverride)
  const alias = resolveTemplateAlias(template, resolvedLocale)
  const templateId = resendTemplateIds[alias]
  const variables = resolveTemplateVariables(template)

  if (!resend) {
    console.warn('RESEND_SENDING_API_KEY is not set. Email not sent.')
    if (env.NODE_ENV !== 'production') {
      console.log('--- SIMULATED EMAIL ---')
      console.log('To:', to)
      console.log('Locale:', resolvedLocale)
      console.log('Subject:', subject)
      console.log('Alias:', alias)
      console.log('Template:', template.name)
      console.log('Data:', template.data)
      console.log('Text:', resolveTemplateText(template, resolvedLocale))
      console.log('Variables:', variables)
      console.log('-----------------------')
      return { id: 'simulated', error: null }
    }
    return { id: null, error: { message: 'RESEND_SENDING_API_KEY is not set', name: 'missing_api_key' } }
  }

  if (!templateId) {
    const message = `Missing Resend template ID for alias "${alias}". Run the template sync and commit the updated template ID map.`
    console.error(message)
    if (env.NODE_ENV !== 'production') {
      return { id: 'missing-template-id', error: { message, name: 'missing_template_id' } }
    }
    throw new Error(message)
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      template: {
        id: templateId,
        variables,
      },
    })

    if (data.error) {
      console.error('Error sending email:', data.error)
    }

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
