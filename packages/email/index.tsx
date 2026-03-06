import { Resend } from 'resend'
import { AccountApprovedEmail, type AccountApprovedEmailProps } from './emails/account-approved-email'
import { OtpLoginEmail, type OtpLoginEmailProps } from './emails/otp-login-email'
import { TeamInviteEmail, type TeamInviteEmailProps } from './emails/team-invite-email'
import { env } from './env'
import { defaultEmailLocale, type EmailLocale, isEmailLocale } from './templates'
import { getOtpLoginCopy, getTeamInviteCopy } from './templates/copy'

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
      return getOtpLoginCopy(locale).subject
    case 'team-invite':
      return getTeamInviteCopy(locale).subject(template.data.teamName)
    case 'account-approved':
      return 'Your ValGuide account has been approved'
    default:
      throw new Error(`Unknown template: ${(template as EmailTemplate).name}`)
  }
}

export async function sendEmail({ to, locale, subject: subjectOverride, template }: SendEmailOptions) {
  const resolvedLocale = normalizeLocale(locale)
  const subject = resolveSubject(template, resolvedLocale, subjectOverride)

  if (!resend) {
    console.warn('RESEND_SENDING_API_KEY is not set. Email not sent.')
    if (env.NODE_ENV !== 'production') {
      console.log('--- SIMULATED EMAIL ---')
      console.log('To:', to)
      console.log('Locale:', resolvedLocale)
      console.log('Subject:', subject)
      console.log('Template:', template.name)
      console.log('Data:', template.data)
      console.log('-----------------------')
      return { id: 'simulated', error: null }
    }
    return { id: null, error: { message: 'RESEND_SENDING_API_KEY is not set', name: 'missing_api_key' } }
  }

  let react: React.ReactNode

  switch (template.name) {
    case 'team-invite':
      react = <TeamInviteEmail {...template.data} locale={resolvedLocale} />
      break
    case 'account-approved':
      react = <AccountApprovedEmail {...template.data} />
      break
    case 'otp-login':
      react = <OtpLoginEmail {...template.data} locale={resolvedLocale} />
      break
    default:
      throw new Error(`Unknown template: ${(template as EmailTemplate).name}`)
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
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
