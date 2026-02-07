"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"

export async function getItemsAction() {
  const session = await requireAuth()

  const items = await prisma.savedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return items
}
