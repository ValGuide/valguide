import { Link, useLocation } from '@tanstack/react-router'
import { useTheme } from '@valguide/core/features/app-theme/theme-provider'
import type { Theme } from '@valguide/core/features/app-theme/types'
import { Button } from '@valguide/ui/components/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@valguide/ui/components/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import {
  BookOpen,
  Building2,
  Globe,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sun,
  Users,
} from 'lucide-react'
import * as React from 'react'

const themeOrder: Theme[] = ['light', 'dark', 'system']
const themeIcon: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor }
const themeLabel: Record<Theme, string> = { light: 'Light', dark: 'Dark', system: 'System' }

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  pathname?: string
  userEmail?: string
  onLogout?: () => void
}

export function AdminSidebar({ pathname: pathnameProp, userEmail, onLogout, ...props }: AdminSidebarProps) {
  const { setOpenMobile, toggleSidebar, state, isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const pathname = pathnameProp ?? location.pathname ?? '/'

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navItems = [
    { title: 'Tours', path: '/tours', icon: BookOpen },
    { title: 'Users', path: '/users', icon: Users },
    { title: 'Organizations', path: '/orgs', icon: Building2 },
    { title: 'Approved Domains', path: '/approved-domains', icon: Globe },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 px-2.5 truncate transition-[opacity,width,padding] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden">
            <Shield className="size-5 shrink-0" />
            <h1 className="text-lg font-medium truncate">Admin</h1>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg mr-0.5"
                onClick={toggleSidebar}
                tabIndex={isMobile ? -1 : 0}
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
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.path)}>
                  <Link to={item.path} preload="intent" onClick={(e) => isActive(item.path) && e.preventDefault()}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`Theme: ${themeLabel[theme]}`}
              onClick={() => {
                const next = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
                setTheme(next)
              }}
            >
              {React.createElement(themeIcon[theme])}
              <span className="truncate">{themeLabel[theme]}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={userEmail ?? 'Sign out'} onClick={onLogout}>
              <LogOut />
              <span className="truncate">{userEmail ?? 'Sign out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
