import { Link, type LinkOptions, useLocation } from '@tanstack/react-router'
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
  SidebarMenuBadge,
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
  Inbox,
  LifeBuoy,
  Link2,
  MapPin,
  MessageSquare,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Settings2,
} from 'lucide-react'
import * as React from 'react'
import { NavUser } from '@/components/nav-user'
import { CreateTeamDialog, type CreateTeamResult } from '@/features/orgs/components/create-team-dialog'
import { type Team, TeamSwitcher } from '@/features/orgs/components/team-switcher'

export function AppSidebar({
  pathname: pathnameProp,
  user,
  teams,
  currentTeam,
  onTeamSwitch,
  onLogout,
  onCreateTeam,
  onFeedback,
  pendingInvitationsCount = 0,
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
  onCreateTeam?: (name: string) => Promise<CreateTeamResult>
  onFeedback?: () => void
  pendingInvitationsCount?: number
}) {
  const { setOpenMobile, toggleSidebar, state, isMobile } = useSidebar()
  const t = useTranslations('sidebar.nav')
  const tSidebar = useTranslations('sidebar')
  const tSections = useTranslations('sidebar.sections')
  const location = useLocation()
  const pathnameFromRouter = location.pathname
  const [createTeamOpen, setCreateTeamOpen] = React.useState(false)

  // Use prop if provided (e.g., in Storybook), otherwise use router pathname
  const pathname = pathnameProp ?? pathnameFromRouter ?? '/'

  // Remove locale prefix from pathname (e.g., /de/analytics -> /analytics, /de -> /)
  const pathnameWithoutLocale = unlocalizedPathname(pathname)

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    }
  }

  // Helper to determine if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathnameWithoutLocale === '/' || pathnameWithoutLocale.startsWith('/tours')
    }
    return pathnameWithoutLocale.startsWith(path)
  }

  const isExactPath = (path: string) => pathnameWithoutLocale === path || pathnameWithoutLocale === `${path}/`

  // Helper to create nav items with linkOptions
  const createNavItems = <T extends { title: string; path: string; icon: typeof BookOpen }>(
    items: T[],
  ): Array<Omit<T, 'path'> & { linkOptions: LinkOptions; isActive: boolean }> =>
    items.map(({ path, ...item }) => ({
      ...item,
      linkOptions: { to: path } as LinkOptions,
      isActive: isActive(path),
    }))

  const contentItems = createNavItems([
    { title: t('tours'), path: '/tours', icon: BookOpen },
    { title: t('stops'), path: '/stops', icon: MapPin },
    { title: t('archived'), path: '/archived', icon: Archive },
  ])

  const performanceItems = createNavItems([{ title: t('analytics'), path: '/analytics', icon: BarChart3 }])

  const libraryItems = createNavItems([
    { title: t('assets'), path: '/assets', icon: Image },
    { title: t('links'), path: '/links', icon: Link2 },
  ])

  const workspaceItem = createNavItems([{ title: t('workspace'), path: '/settings', icon: Settings2 }])[0]
  const invitesItem = createNavItems([{ title: t('invites'), path: '/invites', icon: Inbox }])[0]
  const supportItem = createNavItems([{ title: t('support'), path: '/support', icon: LifeBuoy }])[0]
  const sidebarToggleLabel = isMobile || state === 'expanded' ? tSidebar('collapse') : tSidebar('expand')

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex h-12 items-center justify-between group-data-[collapsible=icon]:justify-center">
            <h1 className="text-lg font-medium px-2.5 truncate transition-[opacity,width,padding] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden">
              {tSidebar('appName')}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg mr-0.5"
                  onClick={toggleSidebar}
                  tabIndex={isMobile ? -1 : 0}
                  aria-label={sidebarToggleLabel}
                >
                  {isMobile || state === 'expanded' ? (
                    <PanelLeftClose className="size-4" />
                  ) : (
                    <PanelLeftOpen className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" hidden={isMobile}>
                {sidebarToggleLabel}
              </TooltipContent>
            </Tooltip>
          </div>
          <TeamSwitcher
            teams={teams}
            activeTeamId={currentTeam?.id}
            onTeamSwitch={onTeamSwitch}
            onCreateTeam={() => setCreateTeamOpen(true)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-2.5 uppercase">{tSections('content')}</SidebarGroupLabel>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link
                      {...item.linkOptions}
                      preload="intent"
                      onClick={(event) => {
                        if (isExactPath(item.linkOptions.to as string)) {
                          event.preventDefault()
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-2.5 uppercase">{tSections('performance')}</SidebarGroupLabel>
            <SidebarMenu>
              {performanceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link
                      {...item.linkOptions}
                      preload="intent"
                      onClick={(event) => {
                        if (isExactPath(item.linkOptions.to as string)) {
                          event.preventDefault()
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-2.5 uppercase">{tSections('library')}</SidebarGroupLabel>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                    <Link
                      {...item.linkOptions}
                      preload="intent"
                      onClick={(event) => {
                        if (isExactPath(item.linkOptions.to as string)) {
                          event.preventDefault()
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-2.5 uppercase">{t('brandKit')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('theme')} isActive={pathnameWithoutLocale === '/brand/theme'}>
                  <Link to="/brand/theme" preload="intent" onClick={() => setOpenMobile(false)}>
                    <Palette />
                    <span>{t('theme')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('qrCode')} isActive={pathnameWithoutLocale === '/brand/qr'}>
                  <Link to="/brand/qr" preload="intent" onClick={() => setOpenMobile(false)}>
                    <QrCode />
                    <span>{t('qrCode')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-2.5 uppercase">{tSections('settings')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={workspaceItem.title} isActive={workspaceItem.isActive}>
                  <Link
                    {...workspaceItem.linkOptions}
                    preload="intent"
                    onClick={(event) => {
                      if (isExactPath(workspaceItem.linkOptions.to as string)) {
                        event.preventDefault()
                        setOpenMobile(false)
                      }
                    }}
                  >
                    <workspaceItem.icon />
                    <span>{workspaceItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {onFeedback && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={t('feedback')}
                    onClick={() => {
                      onFeedback()
                      setOpenMobile(false)
                    }}
                  >
                    <MessageSquare />
                    <span>{t('feedback')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={supportItem.title} isActive={supportItem.isActive}>
                  <Link
                    {...supportItem.linkOptions}
                    preload="intent"
                    onClick={(event) => {
                      if (isExactPath(supportItem.linkOptions.to as string)) {
                        event.preventDefault()
                        setOpenMobile(false)
                      }
                    }}
                  >
                    <supportItem.icon />
                    <span>{supportItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {pendingInvitationsCount > 0 ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={invitesItem.title} isActive={invitesItem.isActive}>
                  <Link
                    {...invitesItem.linkOptions}
                    preload="intent"
                    onClick={(event) => {
                      if (isExactPath(invitesItem.linkOptions.to as string)) {
                        event.preventDefault()
                        setOpenMobile(false)
                      }
                    }}
                  >
                    <invitesItem.icon />
                    <span>{invitesItem.title}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>{pendingInvitationsCount}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : null}
          <NavUser user={user} onLogout={handleLogout} />
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
