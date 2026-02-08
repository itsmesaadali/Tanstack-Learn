'use client'

import {
  BookmarkIcon,
  Bot,
  Compass,
  Import,
} from 'lucide-react'

import { NavPrimary} from './nav-primary'
import { NavUser } from './nav-user'
import type { NavPrimaryProps, NavUserProps } from '@/lib/types'
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
import Link from 'next/link'



const navItems : NavPrimaryProps['items'] = 
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


export function AppSidebar({ user }:NavUserProps) {
  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size={'lg'} className=''>
              <Link href="/dashboard/items" className="flex items-center gap-3">
                <div className='bg-sidebar-background flex aspect-square size-8 items-center justify-center rounded-md border'>
                  <Bot  className='size-4' />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium ">AI Scraping</span>
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
