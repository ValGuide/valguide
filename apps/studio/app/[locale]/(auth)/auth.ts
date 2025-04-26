import NextAuth from 'next-auth'
import { PostgresDrizzleAdapter } from '@valguide/core/auth/adapter'
import { db } from '@valguide/core/db'
import { account, authenticator, session, user, verificationToken } from '@valguide/core/auth/schema'
import { waitUntil } from '@vercel/functions'
import { createLogger } from '@valguide/logger'
import { sendSlackMessage } from '@/slack/send-slack-message'
import { newUserSignedUpMessage } from '@/slack/messages/new-user-signed-up.message'
import { ResendOtpProvider } from '@/app/[locale]/(auth)/resend-otp-provider'

const log = createLogger('auth')

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [ResendOtpProvider()],
  adapter: PostgresDrizzleAdapter(db, {
    accountsTable: account,
    authenticatorsTable: authenticator,
    sessionsTable: session,
    usersTable: user,
    verificationTokensTable: verificationToken,
  }),
  callbacks: {
    authorized: ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      log.info('Auth - authorized', { auth })
      return Boolean(auth)
    },
    jwt: async ({ token, session, user }) => {
      log.info('Auth - jwt', { session, user, token })
      return token
    },
    session: ({ session, user, token }) => {
      log.info('Auth - session', { session, user, token })
      // session.user.onboarded = user.onboarded
      return session
    },
  },

  events: {
    signIn: async ({ user, isNewUser }) => {
      if (isNewUser) {
        waitUntil(sendSlackMessage(newUserSignedUpMessage(user)))
      }
    },
  },
  pages: {
    signIn: '/login/email',
    verifyRequest: '/login/email/verify',
    error: '/login/error',
  },
})
