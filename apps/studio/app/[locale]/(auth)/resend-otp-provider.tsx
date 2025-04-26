import type { EmailConfig } from 'next-auth/providers'
import { otpLoginEmailHtml, otpLoginEmailText } from '@valguide/transactional/emails/otp-login-email.html'
import * as uuid from 'uuid'
import { createLogger } from '@valguide/logger'
import { otpConfig } from '@/app/[locale]/(auth)/otp-config'

const log = createLogger('email-otp')

const from = 'Demo <no-reply@valguide.com>'

const maxValidMinutes = 3

const baseUrl = process.env.NEXT_PUBLIC_DEMO_URL ?? 'https://demo.com'

const logoUrl = `${baseUrl}/static/demo-logo.png`

export const ResendOtpProvider = (): EmailConfig => {
  return {
    id: 'email-otp',
    type: 'email',
    name: 'Resend OTP',
    from,
    apiKey: process.env.AUTH_RESEND_KEY,
    maxAge: maxValidMinutes * 60,
    generateVerificationToken() {
      return gernerateOTP().toString()
    },
    async sendVerificationRequest(params) {
      const { identifier: to, token: code, provider } = params

      // TODO auth: test what happens if this fails. should show error in frontend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: provider.from,
          to,
          subject: `Verify your login`,
          html: otpLoginEmailHtml({ code, maxValidMinutes, logoUrl }),
          text: otpLoginEmailText({ code, maxValidMinutes }),
          headers: {
            'X-Entity-Ref-ID': uuid.v4(),
          },
        }),
      })

      if (!res.ok) {
        const error = (await res.json()) as unknown
        log.error('Failed to send email OTP', error)
        throw new Error(`Resend error: ${JSON.stringify(error)}`)
      }
    },
  }
}

const gernerateOTP = () =>
  Math.floor(Math.pow(10, otpConfig.length - 1) + Math.random() * 9 * Math.pow(10, otpConfig.length - 1))
