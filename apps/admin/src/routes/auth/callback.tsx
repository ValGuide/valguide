import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { serverEnv } from '@valguide/core/env/server'
import { z } from 'zod'
import { createAdminClient } from '@/server/supabase'
import { isSuperadmin } from '@/server/utils/superadmin'

const exchangeCodeFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await createAdminClient()
    const { error } = await supabase.auth.exchangeCodeForSession(data.code)
    if (error) {
      return { success: false, error: error.message }
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    // Verify Slack workspace matches expected team
    if (serverEnv.SLACK_TEAM_ID) {
      const slackIdentity = user?.identities?.find((i) => i.provider === 'slack_oidc')
      const slackTeamId =
        slackIdentity?.identity_data?.['https://slack.com/team_id'] ?? slackIdentity?.identity_data?.team_id
      if (slackTeamId && slackTeamId !== serverEnv.SLACK_TEAM_ID) {
        await supabase.auth.signOut()
        return { success: false, error: 'Access denied: wrong Slack workspace' }
      }
    }

    // Verify superadmin status
    const email = user?.email
    if (!isSuperadmin(email)) {
      await supabase.auth.signOut()
      return { success: false, error: 'Access denied: not authorized for admin access' }
    }

    return { success: true }
  })

export const Route = createFileRoute('/auth/callback')({
  validateSearch: z.object({
    code: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    if (search.error) {
      throw redirect({
        to: '/login',
        search: { next: undefined, email: undefined },
      })
    }

    if (!search.code) {
      throw redirect({ to: '/login' })
    }

    const result = await exchangeCodeFn({ data: { code: search.code } })
    if (!result.success) {
      throw redirect({
        to: '/login',
        search: { next: undefined, email: undefined },
      })
    }

    throw redirect({ to: '/users' })
  },
})
