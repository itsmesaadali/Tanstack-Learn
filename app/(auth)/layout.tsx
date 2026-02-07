
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'


export default function RouteComponent({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen'>
      <div className='absolute top-8 left-8'>
        <Link href='/' className={buttonVariants({ variant: 'secondary' })}>
        <ArrowLeft className='size-4' />
        Back to home</Link>
      </div>
      <div className="flex min-h-screen items-center justify-center">

      {children}
      </div>

      </div>
  )
}
