import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { CreateTeamDialog } from '@valguide/core/features/orgs/components/create-team-dialog'
import { type Team, TeamSwitcher } from '@valguide/core/features/orgs/components/team-switcher'
import { useTranslations } from '@valguide/core/i18n/client'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import { Button } from '@valguide/ui/components/button'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import {
  Archive,
  BarChart3,
  BookOpen,
  Image,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  SlidersHorizontal,
} from 'lucide-react'
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
  onTeamSwitch?: (teamId: string) => void
  onLogout?: () => void
  onCreateTeam?: (name: string, slug?: string) => Promise<unknown>
}) {
  const { setOpenMobile, toggleSidebar, state, isMobile } = useSidebar()
  const t = useTranslations('sidebar.nav')
  const tSidebar = useTranslations('sidebar')
  const tSections = useTranslations('sidebar.sections')
  const location = useLocation()
  const pathnameFromRouter = location.pathname
  const router = useRouter()
  const [createTeamOpen, setCreateTeamOpen] = React.useState(false)

  // Use prop if provided (e.g., in Storybook), otherwise use router pathname
  const pathname = pathnameProp ?? pathnameFromRouter ?? '/'

  // Remove locale prefix from pathname (e.g., /de/analytics -> /analytics, /de -> /)
  const pathnameWithoutLocale = unlocalizedPathname(pathname)

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathnameFromRouter])

  const handleNavClick = () => {
    setOpenMobile(false)
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    }
  }

  // Helper to determine if a URL is active
  const isActive = (url: string) => {
    if (url === '/') {
      return pathnameWithoutLocale === '/' || pathnameWithoutLocale.startsWith('/guides')
    }
    return pathnameWithoutLocale.startsWith(url)
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
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <h1 className="text-lg font-medium px-2 truncate transition-[opacity,width,padding] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden">
              {tSidebar('appName')}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg"
                  onClick={toggleSidebar}
                  tabIndex={isMobile ? -1 : 0}
                  aria-label={isMobile || state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {isMobile || state === 'expanded' ? (
                    <PanelLeftClose className="size-4" />
                  ) : (
                    <PanelLeftOpen className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" hidden={isMobile}>
                {state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
              </TooltipContent>
            </Tooltip>
          </div>
          <TeamSwitcher
            teams={teams}
            activeTeamId={currentTeam?.id}
            onTeamSwitch={onTeamSwitch}
            onCreateTeam={() => {
              setCreateTeamOpen(true)
              setOpenMobile(false)
            }}
            onTeamSettings={() => router.navigate({ to: '/team' })}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">{tSections('content')}</SidebarGroupLabel>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">{tSections('performance')}</SidebarGroupLabel>
            <SidebarMenu>
              {performanceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">{tSections('library')}</SidebarGroupLabel>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">{tSections('settings')}</SidebarGroupLabel>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link to={item.url} preload="intent" onClick={handleNavClick}>
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
