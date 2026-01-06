'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@valguide/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@valguide/ui/components/sidebar'
import { ChevronsUpDown, Plus, Settings } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import * as React from 'react'

export type OrgRole = 'owner' | 'admin' | 'curator' | 'editor' | 'viewer'

export interface Team {
  id: string
  name: string
  slug: string
  logo?: string | null
  role: OrgRole
}

export interface TeamSwitcherProps {
  teams: Team[]
  activeTeamSlug?: string
  onTeamSwitch?: (teamSlug: string) => void
  onCreateTeam?: () => void
  onTeamSettings?: (teamSlug: string) => void
}

const roleLabels: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  curator: 'Curator',
  editor: 'Editor',
  viewer: 'Viewer',
}

function getTeamInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TeamSwitcher({ teams, activeTeamSlug, onTeamSwitch, onCreateTeam, onTeamSettings }: TeamSwitcherProps) {
  const { isMobile } = useSidebar()
  const t = useTranslations('orgs.teamSwitcher')
  const [isMounted, setIsMounted] = React.useState(false)

  const activeTeam = teams.find((team) => team.slug === activeTeamSlug) ?? teams[0]

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!activeTeam) {
    return null
  }

  const handleTeamSwitch = (teamSlug: string) => {
    if (onTeamSwitch) {
      onTeamSwitch(teamSlug)
    }
  }

  const handleCreateTeam = () => {
    if (onCreateTeam) {
      onCreateTeam()
    }
  }

  const handleTeamSettings = () => {
    if (onTeamSettings && activeTeam) {
      onTeamSettings(activeTeam.slug)
    }
  }

  // Loading/SSR state
  if (!isMounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{getTeamInitials(activeTeam.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeTeam.name}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {activeTeam.logo && <AvatarImage src={activeTeam.logo} alt={activeTeam.name} />}
                <AvatarFallback className="rounded-lg">{getTeamInitials(activeTeam.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTeam.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t('teams')}</DropdownMenuLabel>
            {teams.map((team, _index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamSwitch(team.slug)}
                className="cursor-pointer gap-2 p-2"
                disabled={team.slug === activeTeam.slug}
              >
                <Avatar className="size-6 rounded-md">
                  {team.logo && <AvatarImage src={team.logo} alt={team.name} />}
                  <AvatarFallback className="rounded-md text-xs">{getTeamInitials(team.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">{roleLabels[team.role]}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {onCreateTeam && (
              <DropdownMenuItem onClick={handleCreateTeam} className="cursor-pointer gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t('createTeam')}</div>
              </DropdownMenuItem>
            )}
            {onTeamSettings && (
              <DropdownMenuItem onClick={handleTeamSettings} className="cursor-pointer gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Settings className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t('teamSettings')}</div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
