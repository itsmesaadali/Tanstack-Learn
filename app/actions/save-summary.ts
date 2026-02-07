"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { generateText } from "ai"
import { openrouter } from "@/lib/openRouter"
import z from "zod"
import { notFound } from "next/navigation"

const schema = z.object({
  id: z.string(),
  summary: z.string(),
})

export async function saveSummaryAction(input: z.infer<typeof schema>) {
  const { id, summary } = schema.parse(input)
  const session = await requireAuth()

  const existing = await prisma.savedItem.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!existing) notFound()

  const { text } = await generateText({
    model: openrouter.chat("xiaomi/mimo-v2-flash:free"),
    prompt: `Generate 3–5 comma-separated tags for:\n\n${summary}`,
  })

  const tags = text
    .split(",")
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5)

  return prisma.savedItem.update({
    where: { id },
    data: { summary, tags },
  })
}
