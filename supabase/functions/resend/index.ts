// Supabase Auth Hook for sending custom emails via Resend
// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/functions-js/edge-runtime.d.ts'
import { Resend } from 'resend'
import { Webhook } from 'standardwebhooks'

const RESEND_API_KEY = Deno.env.get('RESEND_SENDING_API_KEY')
const HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
const SENDER_EMAIL = 'ValGuide <team@valguide.com>'

const resend = new Resend(RESEND_API_KEY)

// Mapping of email action types to Resend template IDs
const EMAIL_TEMPLATES: Record<string, string> = {
  signup: 'otp-login',
  magiclink: 'otp-login',
  recovery: 'otp-login', // TODO: Create a password recovery template
  invite: 'team-invite',
}

// Types for the webhook payload
interface WebhookPayload {
  user: {
    id: string
    email: string
    user_metadata?: Record<string, unknown>
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!RESEND_API_KEY || !HOOK_SECRET) {
    console.error('Missing required environment variables.')
    return new Response('Internal Server Error: Configuration missing', {
      status: 500,
    })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const wh = new Webhook(HOOK_SECRET.replace('v1,whsec_', ''))

  console.info('Using env variables:', {
    RESEND_API_KEY: RESEND_API_KEY ? 'set' : 'not set',
    HOOK_SECRET: HOOK_SECRET ? 'set' : 'not set',
    SENDER_EMAIL,
  })

  try {
    const {
      user,
      email_data: { token, email_action_type },
    } = wh.verify(payload, headers) as unknown as WebhookPayload

    const templateId = EMAIL_TEMPLATES[email_action_type]

    if (!templateId) {
      console.warn(`No template found for action type: ${email_action_type}`)
      throw new Error(`Unsupported email action type: ${email_action_type}`)
    }

    // Send the email via Resend using templates
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [user.email],
      template: {
        id: templateId,
        variables: {
          CODE: token,
          MAX_VALID_MINUTES: 60,
        },
      },
    })

    if (error) {
      console.error('Error sending email via Resend:', error)
      throw error
    }

    console.log(`Email sent successfully for ${email_action_type} to ${user.email}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing email webhook:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
})
