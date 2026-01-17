"use client"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavPrimaryProps } from "@/lib/types"
import { Link } from "@tanstack/react-router"



export function NavPrimary({ items }: NavPrimaryProps) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {items.map((item, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton asChild className="mt-1">
              <Link activeProps={{
                'data-active' : true,
              }}
              to={item.to} activeOptions={item.activeOptions}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          
          </SidebarMenuItem>
        ))}
        
      </SidebarMenu>
    </SidebarGroup>
  )
}
