import type { Team } from '@valguide/core/features/orgs/components/team-switcher'

export interface SidebarData {
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: Team[]
  currentTeam: Team | undefined
  wasAutoSelected: boolean
}

export async function fetchSidebarData(url: string): Promise<SidebarData | null> {
  const res = await fetch(url)

  if (res.status === 401) {
    return null
  }

  if (!res.ok) {
    throw new Error('Failed to fetch sidebar data')
  }

  return res.json()
}
