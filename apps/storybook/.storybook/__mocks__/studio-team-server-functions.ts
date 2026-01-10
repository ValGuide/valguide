// Mock for @/features/team/server-functions (studio app)

export const getTeamDataFn = async () => ({
  team: {
    id: 'mock-team-id',
    name: 'Mock Team',
    slug: 'mock-team',
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
