import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_SENDING_API_KEY'))
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')

type EmailActionType = 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email_change' | 'reauthentication'

interface AuthEmailPayload {
  user: {
    id: string
    email: string
    user_metadata?: Record<string, unknown>
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: EmailActionType
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  let data: AuthEmailPayload

  if (hookSecret) {
    const wh = new Webhook(hookSecret)
    try {
      data = wh.verify(payload, headers) as AuthEmailPayload
    } catch (error) {
      console.error('Webhook verification failed:', error)
      return Response.json({ error: { http_code: 401, message: 'Invalid webhook signature' } }, { status: 401 })
    }
  } else {
    console.warn('SEND_EMAIL_HOOK_SECRET not set - skipping verification (dev mode)')
    data = JSON.parse(payload) as AuthEmailPayload
  }

  const {
    user,
    email_data: { token, email_action_type },
  } = data

  if (email_action_type === 'magiclink' || email_action_type === 'signup') {
    const { error } = await resend.emails.send({
      from: 'ValGuide <noreply@valguide.com>',
      to: user.email,
      subject: 'Your ValGuide Login Code',
      html: renderOtpEmail(token),
    })

    if (error) {
      console.error('Failed to send email:', error)
      return Response.json({ error: { http_code: 500, message: error.message } }, { status: 500 })
    }
  } else {
    console.log(`Unhandled email action type: ${email_action_type}`)
  }

  return Response.json({})
})

function renderOtpEmail(code: string): string {
  const maxValidMinutes = 60
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #ffffff; margin: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 8px;">
  <div style="border: 1px solid #eaeaea; border-radius: 4px; margin: 40px auto; padding: 20px; max-width: 465px;">
    <h1 style="color: #000000; font-size: 24px; font-weight: normal; text-align: center; padding: 0; margin: 30px 0;">
      Your login code for <strong>ValGuide</strong>
    </h1>
    <div style="background: rgba(0,0,0,.05); border-radius: 4px; margin: 16px auto 14px; vertical-align: middle; width: 280px; text-align: center;">
      <p style="color: #000000; display: inline-block; font-family: HelveticaNeue-Bold, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: 6px; line-height: 40px; padding: 8px 0; margin: 0 auto; width: 100%; text-align: center;">
        ${code}
      </p>
    </div>
    <p style="padding-top: 8px; text-align: center; line-height: 26px; font-size: 16px; margin: 0;">
      This code expires in ${maxValidMinutes} minutes.
    </p>
    <p style="padding-top: 8px; text-align: center; line-height: 26px; font-size: 12px; color: #666666; margin: 0;">
      If you didn't request this, please ignore this email.
    </p>
  </div>
</body>
</html>
`
}
