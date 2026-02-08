"use server"

import z from "zod"
import { prisma } from "@/lib/prisma"
import { firecrawl } from "@/lib/firecrawl"
import { extractSchema, importSchema } from "@/app/schemas/import"
import { requireAuth } from "@/lib/session"

export async function scrapeUrlAction(input: z.infer<typeof importSchema>) {
  const data = importSchema.parse(input)
  const session = await requireAuth()

  const item = await prisma.savedItem.create({
    data: {
      url: data.url,
      userId: session.user.id,
      status: "PROCESSING",
    },
  })

  try {
    const result = await firecrawl.scrape(data.url, {
      formats: [
        "markdown",
        {
          type: "json", schema: extractSchema,

          // prompt: 'Please extract the following fields from the webpage: publishedAt (the date the content was published at timestamp), author (the name of the author)',
        },
      ],
      location: { country: "US", languages: ["en"] },
      onlyMainContent: true,
      proxy: "auto",
    })

    const jsonData = result.json as z.infer<typeof extractSchema>


    let publishedAt = null

    if (jsonData.publishedAt) {
      const date = new Date(jsonData.publishedAt)

      if (!isNaN(date.getTime())) {
        publishedAt = date
      }
    }

    const updatedItem = await prisma.savedItem.update({
      where: { id: item.id },
      data: {
        title: result.metadata?.title ?? null,
        content: result.markdown ?? null,
        ogImage: result.metadata?.ogImage ?? null,
        author: jsonData.author ?? null,
        publishedAt,
        status: "COMPLETED",
      },
    })

    return updatedItem
  } catch {
    const failedItem = prisma.savedItem.update({
      where: { id: item.id },
      data: { status: "FAILED" },
    })

    return failedItem
  }
}
