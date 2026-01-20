import { Link, type LinkOptions } from '@tanstack/react-router'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@valguide/ui/components/sidebar'
import type { LucideIcon } from 'lucide-react'

export interface NavSecondaryItem {
  title: string
  linkOptions: LinkOptions
  icon: LucideIcon
  isActive?: boolean
}

export function NavSecondary({
  items,
  onItemClickAction,
  ...props
}: {
  items: NavSecondaryItem[]
  onItemClickAction?: () => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm" isActive={item.isActive}>
                <Link {...item.linkOptions} preload="intent" onClick={onItemClickAction}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
