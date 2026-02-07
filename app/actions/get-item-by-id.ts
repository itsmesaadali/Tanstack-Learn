"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { notFound } from "next/navigation"

export async function getItemByIdAction(id: string) {
    const session = await requireAuth()

    const item = await prisma.savedItem.findUnique({
        where: {
            id,
            userId: session.user.id,
        },
    })

    if (!item) notFound()
        
    return item
}
