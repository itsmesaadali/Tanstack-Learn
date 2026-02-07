'use client'

import { Copy, Inbox } from 'lucide-react'
import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ItemStatus } from '@/lib/generated/prisma/enums'
import { copyToClipboard } from '@/lib/clipboard'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import z from 'zod'

const itemsSearchParamsSchema = z.object({
  query: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

type ItemsSearchParams = z.infer<typeof itemsSearchParamsSchema>

type Props = {
  itemsPromise: ReturnType<any>
  searchParams: {
    query?: string
    status?: string
  }
}

export default function ItemsClient({ itemsPromise, searchParams }: Props) {
  const router = useRouter()
  const items = use(itemsPromise) as Array<{
    id: string
    title: string
    status: ItemStatus
    summary?: string
    tags: string[]
    url: string
  }>

    // const items = use(itemsPromise)


  const query = searchParams.query ?? ''
  const status = (searchParams.status ?? 'all') as 'all' | ItemStatus

  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    if (searchInput === query) return

    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams as any)
      params.set('query', searchInput)
      router.push(`?${params.toString()}`)
    }, 300)

    return () => clearTimeout(t)
  }, [searchInput])

  const filteredItems = items.filter((item: any) => {
    const matchesStatus = status === 'all' || item.status === status
    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((tag: string) =>
        tag.toLowerCase().includes(query.toLowerCase()),
      )

    return matchesStatus && matchesQuery
  })

  if (filteredItems.length === 0) {
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia>
            <Inbox className="size-16 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No saved items</EmptyTitle>
          <EmptyDescription>
            Try adjusting filters or import new items.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Link
            href="/dashboard/import"
            className={buttonVariants({ variant: 'outline' })}
          >
            Import Items
          </Link>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search by title or tags"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Select
          value={status}
          onValueChange={(value) => {
            const params = new URLSearchParams(searchParams as any)
            params.set('status', value)
            router.push(`?${params.toString()}`)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.values(ItemStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item: any) => (
          <Card key={item.id} className="group overflow-hidden pt-0">
            <Link href={`/dashboard/items/${item.id}`} className="block p-4">
              <CardHeader className="space-y-3">
                <div className="flex justify-between">
                  <Badge>{item.status.toLowerCase()}</Badge>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      copyToClipboard(item.url)
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>

                <CardTitle>{item.title}</CardTitle>

                {item.summary && (
                  <CardDescription>{item.summary}</CardDescription>
                )}
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
