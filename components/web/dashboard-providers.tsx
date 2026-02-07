'use client'

import { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </TooltipProvider>
  )
}
