import { Link, type LinkOptions } from '@tanstack/react-router'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@valguide/ui/components/sidebar'
import type { LucideIcon } from 'lucide-react'

export interface NavMainItem {
  title: string
  linkOptions: LinkOptions
  icon?: LucideIcon
  isActive?: boolean
}

export function NavMain({ items, onItemClickAction }: { items: NavMainItem[]; onItemClickAction?: () => void }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
              <Link {...item.linkOptions} preload="intent" onClick={onItemClickAction}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
