"use server"

import { prisma } from "@/lib/prisma"
import { firecrawl } from "@/lib/firecrawl"
import { requireAuth } from "@/lib/session"
import z, { success } from "zod"
import { extractSchema } from "@/app/schemas/import"

const schema = z.object({
  urls: z.array(z.string().url()),
})


export type BulkScrapeProgess = {
  total: number
  completed: number
  url: string
  status: 'success' | 'failed'
}

export async function startBulkScrapeAction(input: z.infer<typeof schema>) {
  const { urls } = schema.parse(input)
  const session = await requireAuth()

  const total = urls.length
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]

    const item = await prisma.savedItem.create({
      data: {
        url: url,
        userId: session.user.id,
        status: 'PENDING',
      },
    })

    let status: BulkScrapeProgess['status'] = 'success'

    try {
      const result = await firecrawl.scrape(url, {
        formats: [
          'markdown',
          {
            type: 'json',
            // schema: extractSchema,
            prompt: 'Please extract the following fields from the webpage: publishedAt (the date the content was published at timestamp), author (the name of the author)',
          },
        ],
        location: {
          country: 'US',
          languages: ['en'],
        },
        onlyMainContent: true,
        proxy: 'auto',
      })

      const jsonData = result.json as z.infer<typeof extractSchema>

      let publishedAt = null

      if (jsonData.publishedAt) {
        const date = new Date(jsonData.publishedAt)

        if (!isNaN(date.getTime())) {
          publishedAt = date
        }
      }

      await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData.author || null,
          publishedAt: publishedAt,
          status: 'COMPLETED',
        },
      })

    } catch {

      status = 'failed'
      await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })

    }

    const progress: BulkScrapeProgess = {
      total,
      completed: i + 1,
      url,
      status,
    }

    return { success:true}

  }
}
