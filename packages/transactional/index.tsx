import { Resend } from 'resend'
import { TeamInviteEmail, TeamInviteEmailProps } from './emails/team-invite-email'

// Initialize Resend with API key from environment
// Don't throw if key is missing, we'll handle it in sendEmail
const resend = process.env.VG_RESEND_SENDING_API_KEY 
  ? new Resend(process.env.VG_RESEND_SENDING_API_KEY)
  : null

// Configurable sender
const FROM_EMAIL = process.env.VG_EMAIL_FROM || 'ValGuide <noreply@valguide.com>'

export type EmailTemplate = 
  | { name: 'team-invite'; data: TeamInviteEmailProps }

export interface SendEmailOptions {
  to: string
  subject: string
  template: EmailTemplate
}

export async function sendEmail({ to, subject, template }: SendEmailOptions) {
  if (!resend) {
    console.warn('VG_RESEND_SENDING_API_KEY is not set. Email not sent.')
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- SIMULATED EMAIL ---')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('Template:', template.name)
      console.log('Data:', template.data)
      console.log('-----------------------')
      return { id: 'simulated', error: null }
    }
    return { id: null, error: { message: 'VG_RESEND_SENDING_API_KEY is not set', name: 'missing_api_key' } }
  }

  let react: React.ReactNode

  switch (template.name) {
    case 'team-invite':
      react = <TeamInviteEmail {...template.data} />
      break
    default:
      throw new Error(`Unknown template: ${(template as any).name}`)
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
