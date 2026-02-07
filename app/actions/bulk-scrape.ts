"use server"

import { prisma } from "@/lib/prisma"
import { firecrawl } from "@/lib/firecrawl"
import { requireAuth } from "@/lib/session"
import z from "zod"

const schema = z.object({
  urls: z.array(z.string().url()),
})

export async function startBulkScrapeAction(input: z.infer<typeof schema>) {
  const { urls } = schema.parse(input)
  const session = await requireAuth()

  for (const url of urls) {
    await prisma.savedItem.create({
      data: {
        url,
        userId: session.user.id,
        status: "PENDING",
      },
    })
  }

  return { started: true }
}
