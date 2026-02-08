'use client'

import type { NavPrimaryProps } from '@/lib/types'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export function NavPrimary({ items }: NavPrimaryProps) {
  const pathname = usePathname()

  const isActive = (to: string, exact?: boolean) => {
    if (exact) {
      return pathname === to
    }
    return pathname.startsWith(to)
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, index) => {
          const active = isActive(item.to, item.activeOptions?.exact)

          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={clsx(
                  'mt-1 transition-colors',
                  active &&
                    'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
              >
                <Link
                  href={item.to}
                  className="flex items-center gap-3"
                >
                  <item.icon
                    className={clsx(
                      'size-4 shrink-0',
                      active && 'text-primary'
                    )}
                  />

                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
