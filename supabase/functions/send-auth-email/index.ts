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
      template: {
        id: 'otp-login',
        variables: {
          CODE: token,
          MAX_VALID_MINUTES: 60,
        },
      },
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
