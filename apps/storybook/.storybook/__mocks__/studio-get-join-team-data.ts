// Mock for @/features/join-team/get-join-team-data (studio app)

export type JoinTeamData = {
  variant: 'invalid' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
  nextUrl?: string
}

export const getJoinTeamDataFn = async (): Promise<JoinTeamData> => ({
  variant: 'invalid',
})
