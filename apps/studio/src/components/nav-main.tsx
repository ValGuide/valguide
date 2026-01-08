import { Link } from '@tanstack/react-router'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@valguide/ui/components/sidebar'
import type { LucideIcon } from 'lucide-react'

export function NavMain({
  items,
  onItemClickAction,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
  onItemClickAction?: (url: string) => void
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
              <Link to={item.url} onClick={() => onItemClickAction?.(item.url)}>
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
