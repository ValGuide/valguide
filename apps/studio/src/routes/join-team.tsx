import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { getInvitationDataFn } from '@valguide/core/features/orgs/get-invitation-data.fn'
import { joinTeamFn } from '@valguide/core/features/orgs/join-team.fn'
import { sendInviteOtpFn } from '@valguide/core/features/orgs/send-invite-otp.fn'
import { verifyInviteOtpFn } from '@valguide/core/features/orgs/verify-invite-otp.fn'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { JoinTeamCard } from '../features/join-team/components/join-team-card'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/join-team')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps }) => {
    return getInvitationDataFn({ data: { token: deps.token } })
  },
  component: JoinTeamPage,
})

function JoinTeamPage() {
  const data = Route.useLoaderData()
  const { token } = Route.useSearch()
  const queryClient = useQueryClient()
  const router = useRouter()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const joinTeam = useServerFn(joinTeamFn)
  const signOut = useServerFn(signOutFn)
  const sendOtp = useServerFn(sendInviteOtpFn)
  const verifyOtp = useServerFn(verifyInviteOtpFn)

  // Auto-join when already authenticated with correct email
  useEffect(() => {
    if (data.variant === 'joining' && token && !isJoining && !error) {
      setIsJoining(true)
      joinTeam({ data: { token } })
        .then(async (result) => {
          if (result.success) {
            await queryClient.invalidateQueries({
              queryKey: ['user-status'],
            })
            await queryClient.invalidateQueries({
              queryKey: ['is-authenticated'],
            })
            navigate({ to: '/' })
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to join team')
        })
    }
  }, [data.variant, token, joinTeam, isJoining, error, queryClient, navigate])

  const handleSignOut = async () => {
    await signOut({ data: { scope: 'global' } })
    router.invalidate()
  }

  const handleSendOtp = async () => {
    if (!token) return
    const result = await sendOtp({ data: { token } })
    if (!result.success) {
      throw new Error(result.error)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    if (!token) return
    const result = await verifyOtp({ data: { token, otp } })
    if (!result.success) {
      throw new Error(result.error)
    }
    // Verification + join succeeded — navigate to tours
    window.location.replace('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <JoinTeamCard
        variant={data.variant}
        invite={data.invite}
        userEmail={data.userEmail}
        error={error}
        onSendOtp={data.variant === 'public' ? handleSendOtp : undefined}
        onVerifyOtp={data.variant === 'public' ? handleVerifyOtp : undefined}
        onSignOut={data.variant === 'wrong-account' ? handleSignOut : undefined}
      />
    </div>
  )
}
