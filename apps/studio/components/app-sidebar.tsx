'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  AudioWaveform,
  BarChart3,
  Command,
  GalleryVerticalEnd,
  Headphones,
  LifeBuoy,
  Palette,
  Send,
  Settings2,
  Users,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@valguide/ui/components/sidebar'
import { usePathname } from 'next/navigation'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('sidebar.nav')
  const pathname = usePathname()

  // Remove locale prefix from pathname (e.g., /de/analytics -> /analytics, /de -> /)
  const pathnameWithoutLocale = unlocalizedPathname(pathname)

  const navMain = [
    {
      title: t('guides'),
      url: '/',
      icon: Headphones,
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
    isActive: item.url === '' ? pathnameWithoutLocale === '/' : pathnameWithoutLocale === item.url,
  }))

  const navSecondary = [
    {
      title: t('support'),
      url: 'support',
      icon: LifeBuoy,
    },
    {
      title: t('feedback'),
      url: 'feedback',
      icon: Send,
    },
  ].map((item) => ({
    ...item,
    isActive: pathnameWithoutLocale === `/${item.url}`,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
