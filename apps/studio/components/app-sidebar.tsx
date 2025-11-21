'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  Archive,
  AudioWaveform,
  BarChart3,
  BookOpen,
  Image,
  LifeBuoy,
  Palette,
  Send,
  Settings2,
  Users,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher, type Team } from '@valguide/core/features/orgs/components/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@valguide/ui/components/sidebar'
import { usePathname, useRouter } from 'next/navigation'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import { switchTeamAction } from '@valguide/core/features/orgs/context-actions'
import { toast } from 'sonner'
import { CreateTeamDialog } from '@valguide/core/features/orgs/components/create-team-dialog'

export function AppSidebar({
  pathname: pathnameProp,
  user,
  teams,
  currentTeam,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  pathname?: string
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: Team[]
  currentTeam: Team
}) {
  const t = useTranslations('sidebar.nav')
  const pathnameFromRouter = usePathname()
  const router = useRouter()
  const [pendingUrl, setPendingUrl] = React.useState<string | null>(null)
  const [createTeamOpen, setCreateTeamOpen] = React.useState(false)

  // Use prop if provided (e.g., in Storybook), otherwise use router pathname
  const pathname = pathnameProp ?? pathnameFromRouter ?? '/'

  // Remove locale prefix from pathname (e.g., /de/analytics -> /analytics, /de -> /)
  const pathnameWithoutLocale = unlocalizedPathname(pathname)

  // Reset pending URL when pathname changes (navigation completed)
  React.useEffect(() => {
    setPendingUrl(null)
  }, [pathnameWithoutLocale])

  const handleNavClick = (url: string) => {
    setPendingUrl(url)
  }

  const handleTeamSwitch = async (teamSlug: string) => {
    try {
      await switchTeamAction(teamSlug)
      // Note: Action will redirect/reload, but we can show feedback
      toast.success('Switched team')
    } catch (error) {
      console.error(error)
      toast.error('Failed to switch team')
    }
  }

  const handleCreateTeam = () => {
    setCreateTeamOpen(true)
  }

  const handleTeamSettings = (teamSlug: string) => {
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/settings`)
  }

  // Helper to determine if a URL is active
  const isActive = (url: string) => {
    const currentPath = pathnameWithoutLocale
    if (url === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(url)
  }

  const navMain = [
    {
      title: t('guides'),
      url: '/',
      icon: BookOpen,
    },
    {
      title: t('archived'),
      url: '/archived',
      icon: Archive,
    },
    {
      title: t('assets'),
      url: '/assets',
      icon: Image,
    },
    {
      title: t('design'),
      url: '/design',
      icon: Palette,
    },
    {
      title: t('analytics'),
      url: '/analytics',
      icon: BarChart3,
    },
    {
      title: t('teamAndMembers'),
      url: '/team',
      icon: Users,
    },
    {
      title: t('settings'),
      url: '/settings',
      icon: Settings2,
    },
  ].map((item) => ({
    ...item,
    // Update URL to use simple path
    url: item.url,
    isActive: isActive(item.url),
  }))

  const navSecondary = [
    {
      title: t('support'),
      url: '/support',
      icon: LifeBuoy,
    },
    {
      title: t('feedback'),
      url: '/feedback',
      icon: Send,
    },
  ].map((item) => ({
    ...item,
    isActive: isActive(item.url),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher 
          teams={teams} 
          activeTeamSlug={currentTeam.slug}
          onTeamSwitch={handleTeamSwitch}
          onCreateTeam={handleCreateTeam}
          onTeamSettings={handleTeamSettings}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} onItemClickAction={handleNavClick} />
        <NavSecondary items={navSecondary} className="mt-auto" onItemClickAction={handleNavClick} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
      <CreateTeamDialog open={createTeamOpen} onOpenChange={setCreateTeamOpen} showTrigger={false} />
    </Sidebar>
  )
}
