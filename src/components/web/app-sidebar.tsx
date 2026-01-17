'use client'

import {
  BookmarkIcon,
  Compass,
  Import,
} from 'lucide-react'

import { NavPrimary} from './nav-primary'
import { NavUser } from './nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, linkOptions } from '@tanstack/react-router'
import { NavPrimaryProps, NavUserProps } from '@/lib/types'



const navItems : NavPrimaryProps['items'] = linkOptions(
    [
    {
        title: 'Items',
        icon: BookmarkIcon,
        to: '/dashboard/items',
        activeOptions: { exact: false },
    },
    {
        title:'Import',
        icon: Import,
        to: '/dashboard/import',
        activeOptions: { exact: false },
    },
    {
        title: 'Discover',
        icon: Compass,
        to: '/dashboard/discover',
        activeOptions: { exact: false },
    }   
]
)

export function AppSidebar({ user }:NavUserProps) {
  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size={'lg'} className='hover:bg-accent-foreground'>
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md'>
                  <BookmarkIcon  className='size-4' />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium text-white">Recall</span>
                  <span className="text-muted-foreground text-xs">
                    Your AI Assistant
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPrimary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
