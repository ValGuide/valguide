// Mock for @/features/sidebar/get-sidebar-data (studio app)

export const getSidebarDataFn = async () => ({
  user: {
    userId: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    avatar: '',
  },
  teams: [
    {
      id: 'mock-team-id',
      name: 'Mock Team',
      nanoId: 'mockteam01',
    },
  ],
  currentTeam: {
    id: 'mock-team-id',
    name: 'Mock Team',
    nanoId: 'mockteam01',
  },
  wasAutoSelected: false,
})

export interface SidebarData {
  user: {
    userId: string
    name: string
    email: string
    avatar: string
  }
  teams: Array<{ id: string; name: string; nanoId: string }>
  currentTeam: { id: string; name: string; nanoId: string } | undefined
  wasAutoSelected: boolean
}
