'use client'

import { Link } from '@tanstack/react-router'
import type { NavPrimaryProps } from '@/lib/types'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavPrimary({ items }: NavPrimaryProps) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton asChild className="mt-1" tooltip={item.title}>
              <Link
                to={item.to}
                activeOptions={item.activeOptions}
                activeProps={{ 'data-active': true }}
                className="flex items-center gap-3"
              >
                <item.icon className="size-4 shrink-0" />

                {/* Hide text only when collapsed */}
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
