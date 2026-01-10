// Mock for @/features/sidebar/server-functions (studio app)

export const getSidebarDataFn = async () => ({
  user: {
    name: 'Mock User',
    email: 'mock@example.com',
    avatar: '',
  },
  teams: [
    {
      id: 'mock-team-id',
      name: 'Mock Team',
      slug: 'mock-team',
    },
  ],
  currentTeam: {
    id: 'mock-team-id',
    name: 'Mock Team',
    slug: 'mock-team',
  },
  wasAutoSelected: false,
})
