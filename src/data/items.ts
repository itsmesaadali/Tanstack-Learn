import { prisma } from '@/db'
import { firecrawl } from '@/lib/firecrawl'
import { authFnMiddleware } from '@/middlewares/auth'
import { bulkImportSchema, extractSchema, importSchema, searchSchema } from '@/schemas/import'
import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import z from 'zod'
import { generateText } from 'ai'
import { openrouter } from '@/lib/openRouter'
import { SearchResultWeb } from '@mendable/firecrawl-js'

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.session.user.id,
        status: 'PROCESSING',
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema: extractSchema,
            // prompt: 'Please extract the following fields from the webpage: publishedAt (the date the content was published at timestamp), author (the name of the author)',
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

      const updatedItem = await prisma.savedItem.update({
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
      return updatedItem
    } catch {
      const failedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return failedItem
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(bulkImportSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,
      location: {
        country: 'US',
        languages: ['en'],
      },
    })

    return result.links
  })

export type BulkScrapeProgess = {
  total: number
  completed: number
  url:string
  status: 'success' | 'failed' 
}

export const bulkScrapeFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ urls: z.array(z.string().url()) }))
  .handler(async function* ({ data, context })  {
    const total = data.urls.length
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]

      const item = await prisma.savedItem.create({
        data: {
          url: url,
          userId: context.session.user.id,
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
              schema: extractSchema,
              // prompt: 'Please extract the following fields from the webpage: publishedAt (the date the content was published at timestamp), author (the name of the author)',
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

      const progress : BulkScrapeProgess = {
        total,
        completed: i + 1,
        url,
        status,
      }

      yield progress
    }
  })


  export const getItemsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: {
        userId: context.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return items;
  })

  export const getItemById = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string()}))
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.findUnique({
      where: {
        userId: context.session.user.id,
        id: data.id,
      },
    })

    if(!item) {
      throw notFound()
    }

    return item;
  })

  export const saveSummaryAndGenerateTagsFn = createServerFn({ method: 'POST' }).middleware([authFnMiddleware])
  .inputValidator(z.object({
    id: z.string(),
    summary: z.string(),
  }))
  .handler(async ({ data, context }) => {
    const existing = await prisma.savedItem.findUnique({
      where: {
        userId: context.session.user.id,
        id: data.id,
      },
    })

    if(!existing) {
      throw notFound()
    }

    const {text} = await generateText({
      model: openrouter.chat('xiaomi/mimo-v2-flash:free'),
      system: `You are a helpful assistant that generates relevant and concise tags for content based on its summary. The tags should be:
      - 3 to 5 tags
      - Each tag should be a single word or a short phrase
      - Tags should accurately reflect the main topics and themes of the content
      - Return the tags as a comma-separated list
      Example: technology, AI, machine learning, javaScript, web development`,
      prompt: `Based on the following summary, generate a list of relevant tags:\n\n${data.summary}`,
    })

    const tags = text.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0).slice(0,5)


    const item = await prisma.savedItem.update({
      where: {
        userId: context.session.user.id,
        id: data.id,
      },
      data: {
        summary: data.summary,
        tags: tags,
      },
    })

    return item
  })

 export const searchWebFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.search(data.query, {
      limit: 15,
      location: 'USA',
      tbs:'qdr:y',
    })


    return result.web?.map((item) => ({
      url: (item  as SearchResultWeb).url,
      title: (item as SearchResultWeb).title,
      description: (item as SearchResultWeb).description,
    })) as SearchResultWeb[];
  }) 