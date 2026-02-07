"use server"

import { firecrawl } from "@/lib/firecrawl"
import { searchSchema } from "@/app/schemas/import"
import { requireAuth } from "@/lib/session"
import type { SearchResultWeb } from "@mendable/firecrawl-js"

export async function searchWebAction(input: unknown) {
  const data = searchSchema.parse(input)
  await requireAuth()

  const result = await firecrawl.search(data.query, {
    limit: 15,
    location: "USA",
    tbs: "qdr:y",
  })

  return result.web?.map(item => ({
    url: (item as SearchResultWeb).url,
    title: (item as SearchResultWeb).title,
    description: (item as SearchResultWeb).description,
  }))
}
