'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function getItemByIdAction(id: string) {
  const session = await requireAuth()

  if (!id) return null

  const item = await prisma.savedItem.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  return item
}
