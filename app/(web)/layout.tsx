// app/(web)/layout.tsx
import { Navbar } from '@/components/web/navbar'

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
