import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getSession() {
  const headersList = headers()

  const session = await auth.api.getSession({
    headers: Object.fromEntries((await headersList).entries()),
  })

  if (!session) {
    redirect('/login')
  }

  return session
}
