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

export async function saveSummaryActionAndGenTags(input: z.infer<typeof schema>) {
  const { id, summary } = schema.parse(input)
  const session = await requireAuth()

  const existing = await prisma.savedItem.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) notFound()

  const { text } = await generateText({
    model: openrouter.chat("arcee-ai/trinity-large-preview:free"),
    system: `You are a helpful assistant that generates relevant and concise tags for content based on its summary. The tags should be:
      - 3 to 5 tags
      - Each tag should be a single word or a short phrase
      - Tags should accurately reflect the main topics and themes of the content
      - Return the tags as a comma-separated list
      Example: technology, AI, machine learning, javaScript, web development`,
    prompt: `Based on the following summary, generate a list of relevant tags:\n\n${summary}`,
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
