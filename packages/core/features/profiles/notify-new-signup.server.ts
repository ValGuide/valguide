import { sendEmail } from '@valguide/email'
import { serverEnv } from '../../env/server'

export async function notifyNewSignup(userEmail: string) {
  const adminEmail = serverEnv.ADMIN_NOTIFICATION_EMAIL
  if (!adminEmail) {
    console.warn('ADMIN_NOTIFICATION_EMAIL not set — skipping signup notification')
    return
  }

  await sendEmail({
    to: adminEmail,
    subject: `New signup awaiting approval: ${userEmail}`,
    template: {
      name: 'new-signup-notification',
      data: {
        userEmail,
        signupDate: new Date().toISOString(),
        logoUrl: `${serverEnv.VITE_STUDIO_URL}/icon.png`,
      },
    },
  })
}
