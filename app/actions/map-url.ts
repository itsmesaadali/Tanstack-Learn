"use server"

import { bulkImportSchema } from "@/app/schemas/import"
import { firecrawl } from "@/lib/firecrawl"
import { requireAuth } from "@/lib/session"
import z from "zod"

export async function mapUrlAction(
  input: z.infer<typeof bulkImportSchema>
) {
  bulkImportSchema.parse(input)
  await requireAuth()

  const result = await firecrawl.map(input.url, {
    limit: 25,
    search: input.search,
    location: { country: "US", languages: ["en"] },
  })

  return result.links
}
