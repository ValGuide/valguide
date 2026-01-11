import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { CreateTeamDialog } from '@valguide/core/features/orgs/components/create-team-dialog'
import { type Team, TeamSwitcher } from '@valguide/core/features/orgs/components/team-switcher'
import { useTranslations } from '@valguide/core/i18n/client'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@valguide/ui/components/sidebar'
import { Archive, BarChart3, BookOpen, Image, MapPin, Settings2, SlidersHorizontal } from 'lucide-react'
import * as React from 'react'
import { NavUser } from '@/components/nav-user'

export function AppSidebar({
  pathname: pathnameProp,
  user,
  teams,
  currentTeam,
  onTeamSwitch,
  onLogout,
  onCreateTeam,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  pathname?: string
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: Team[]
  currentTeam?: Team
  onTeamSwitch?: (teamSlug: string) => void
  onLogout?: () => void
  onCreateTeam?: (name: string, slug?: string) => Promise<unknown>
}) {
  const { setOpenMobile } = useSidebar()
  const t = useTranslations('sidebar.nav')
  const tSidebar = useTranslations('sidebar')
  const tSections = useTranslations('sidebar.sections')
  const location = useLocation()
  const pathnameFromRouter = location.pathname
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
  }, [])

  // Preload all sidebar routes on mount for instant navigation
  React.useEffect(() => {
    const routes = [
      '/guides',
      '/stops',
      '/analytics',
      '/assets',
      '/design',
      '/settings',
      '/team',
      '/profile',
      '/archived',
    ]
    for (const route of routes) {
      router.preloadRoute({ to: route })
    }
  }, [router])

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathnameFromRouter])

  const handleNavClick = (url: string) => {
    setPendingUrl(url)
    setOpenMobile(false)
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    }
  }

  // Helper to determine if a URL is active
  const isActive = (url: string) => {
    const currentPath = pendingUrl ?? pathnameWithoutLocale
    if (url === '/') {
      return currentPath === '/' || currentPath.startsWith('/guides')
    }
    return currentPath.startsWith(url)
  }

  const contentItems = [
    {
      title: t('guides'),
      url: '/guides',
      icon: BookOpen,
    },
    {
      title: t('stops'),
      url: '/stops',
      icon: MapPin,
    },
    {
      title: t('archived'),
      url: '/archived',
      icon: Archive,
    },
  ].map((item) => ({
    ...item,
    isActive: isActive(item.url),
  }))

  const performanceItems = [
    {
      title: t('analytics'),
      url: '/analytics',
      icon: BarChart3,
    },
  ].map((item) => ({
    ...item,
    isActive: isActive(item.url),
  }))

  const libraryItems = [
    {
      title: t('assets'),
      url: '/assets',
      icon: Image,
    },
  ].map((item) => ({
    ...item,
    isActive: isActive(item.url),
  }))

  const settingsItems = [
    {
      title: t('brandKit'),
      url: '/design',
      icon: SlidersHorizontal,
    },
    {
      title: t('workspace'),
      url: '/settings',
      icon: Settings2,
    },
  ].map((item) => ({
    ...item,
    isActive: isActive(item.url),
  }))

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="px-3 py-4">
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-base font-semibold px-2 truncate">{tSidebar('appName')}</h1>
          </div>
          <TeamSwitcher
            teams={teams}
            activeTeamSlug={currentTeam?.slug}
            onTeamSwitch={onTeamSwitch}
            onCreateTeam={() => {
              setCreateTeamOpen(true)
              setOpenMobile(false)
            }}
            onTeamSettings={() => router.navigate({ to: '/team' })}
          />
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase text-[10px] tracking-wider px-2.5 mb-1">
              {tSections('content')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={() => handleNavClick(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase text-[10px] tracking-wider px-2.5 mb-1">
              {tSections('performance')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {performanceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={() => handleNavClick(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase text-[10px] tracking-wider px-2.5 mb-1">
              {tSections('library')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={() => handleNavClick(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase text-[10px] tracking-wider px-2.5 mb-1">
              {tSections('settings')}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={() => handleNavClick(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} onLogout={handleLogout} handleNavClick={handleNavClick} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {onCreateTeam && (
        <CreateTeamDialog
          open={createTeamOpen}
          onOpenChange={setCreateTeamOpen}
          showTrigger={false}
          onCreateTeam={onCreateTeam}
        />
      )}
    </>
  )
}
