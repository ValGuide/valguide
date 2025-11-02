'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { AudioWaveform, BarChart3, Command, GalleryVerticalEnd, Map, Palette, Settings2, Users } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@valguide/ui/components/sidebar'

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

  const navMain = [
    {
      title: t('guides'),
      url: '#',
      icon: Map,
      isActive: true,
    },
    {
      title: t('design'),
      url: '#',
      icon: Palette,
    },
    {
      title: t('analytics'),
      url: '#',
      icon: BarChart3,
    },
    {
      title: t('teamAndMembers'),
      url: '#',
      icon: Users,
    },
    {
      title: t('settings'),
      url: '#',
      icon: Settings2,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
