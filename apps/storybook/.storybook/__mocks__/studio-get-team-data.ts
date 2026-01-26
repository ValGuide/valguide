// Mock for @/features/team/get-team-data (studio app)

export const getTeamDataFn = async () => ({
  team: {
    id: 'mock-team-id',
    name: 'Mock Team',
    nanoId: 'mockteam01',
  },
  members: [
    {
      id: 'mock-member-id',
      userId: 'mock-user-id',
      email: 'mock@example.com',
      firstName: 'Mock',
      lastName: 'User',
      role: 'owner',
      joinedAt: new Date().toISOString(),
      isOwner: true,
    },
  ],
  pendingInvites: [],
  currentUserRole: 'owner',
  currentUserId: 'mock-user-id',
})

export interface TeamData {
  team: { id: string; name: string; nanoId: string }
  members: Array<{
    id: string
    userId: string
    email: string
    firstName?: string
    lastName?: string
    role: string
    joinedAt: string
    isOwner: boolean
  }>
  pendingInvites: Array<unknown>
  currentUserRole: string
  currentUserId: string
}
