// Mock for @/features/sidebar/hooks/use-sidebar-data

export function useSidebarData() {
  return {
    data: {
      currentTeam: {
        id: 'org-mock-123',
        name: 'Mock Organization',
      },
      teams: [
        {
          id: 'org-mock-123',
          name: 'Mock Organization',
        },
      ],
    },
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: async () => undefined,
  }
}
