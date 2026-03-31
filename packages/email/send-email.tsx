import type { AccountApprovedEmailProps } from './emails/account-approved-email'
import { getAccountApprovedConfig } from './emails/account-approved-template'
import type { OtpLoginEmailProps } from './emails/otp-login-email'
import { getOtpLoginConfig } from './emails/otp-login-template'
import type { TeamInviteEmailProps } from './emails/team-invite-email'
import { getTeamInviteConfig } from './emails/team-invite-template'
import { env } from './env'
import { resendTemplateIds } from './template-ids'
import { getTeamInviteCopy } from './templates/copy'
import { defaultEmailLocale, type EmailLocale, isEmailLocale } from './templates/locales'

// Configurable sender
const FROM_EMAIL = env.EMAIL_FROM
const RESEND_API_URL = 'https://api.resend.com/emails'

type SendEmailResult =
  | {
      id: string
      error: null
    }
  | {
      id: null
      error: {
        message: string
        name: string
        statusCode?: number | null
      }
    }

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

export function resolveSubject(template: EmailTemplate, locale: EmailLocale, subjectOverride?: string): string {
  if (subjectOverride) {
    return subjectOverride
  }

  switch (template.name) {
    case 'otp-login':
      return getOtpLoginConfig(locale).subject
    case 'team-invite':
      return getTeamInviteCopy(locale).subject(template.data.teamName)
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
        LOGO_URL: template.data.logoUrl,
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
  const templateId = resendTemplateIds[alias as keyof typeof resendTemplateIds]
  const variables = resolveTemplateVariables(template)

  if (!env.RESEND_SENDING_API_KEY) {
    console.warn('RESEND_SENDING_API_KEY is not set. Email not sent.')
    if (env.NODE_ENV !== 'production') {
      console.log('--- SIMULATED EMAIL ---')
      console.log('To:', to)
      console.log('Locale:', resolvedLocale)
      console.log('Subject:', subject)
      console.log('Alias:', alias)
      console.log('Template:', template.name)
      console.log('Data:', template.data)
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
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_SENDING_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        template: {
          id: templateId,
          variables,
        },
      }),
    })

    const data = (await response.json()) as
      | {
          id?: string
          message?: string
          name?: string
          statusCode?: number | null
        }
      | undefined

    if (!response.ok || !data?.id) {
      const error = {
        message: data?.message ?? 'Failed to send email',
        name: data?.name ?? 'send_failed',
        statusCode: data?.statusCode ?? response.status,
      }
      console.error('Error sending email:', error)
      return { id: null, error } satisfies SendEmailResult
    }

    return { id: data.id, error: null } satisfies SendEmailResult
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
