import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getItemsFn } from '@/data/items'
import { ItemStatus } from '@/generated/prisma/enums'
import { copyToClipboard } from '@/lib/clipboard'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Copy, Inbox } from 'lucide-react'
import z from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { use, useEffect, useState } from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

const itemsSearchParamsSchema = z.object({
  query: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

type ItemsSearchParams = z.infer<typeof itemsSearchParamsSchema>

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => ({itemsPromise: getItemsFn()}),
  validateSearch: zodValidator(itemsSearchParamsSchema),
})

function ItemList({
  query,
  status,
  data,
}: {
  query: ItemsSearchParams['query']
  status: ItemsSearchParams['status']
  data: ReturnType<typeof getItemsFn>
}) {

  const items = use(data)
  const filteredData = items.filter((item) => {
    const matchesStatus = status === 'all' || item.status === status
    const matchesQuery =
      query === '' ||
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))

    return matchesStatus && matchesQuery
  })

if (filteredData.length === 0) {
  return (
    <Empty className="border rounded-lg h-full">
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Inbox className="size-16 text-muted-foreground" />
        </EmptyMedia>

        <EmptyTitle>
          {items.length === 0
            ? 'No saved items yet.'
            : 'No items match your filters.'}
        </EmptyTitle>

        <EmptyDescription>
          {items.length === 0
            ? 'Start saving articles and resources to see them here.'
            : 'Try adjusting your search or filter criteria.'}
        </EmptyDescription>
      </EmptyHeader>

      {items.length === 0 && (
        <EmptyContent>
          <Link
            to="/dashboard/import"
            className={buttonVariants({ variant: 'outline' })}
          >
            Import Items
          </Link>
        </EmptyContent>
      )}
    </Empty>
  )
}


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredData.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link to="/dashboard" className="block p-4">
            {item.ogImage && (
              <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                <img
                  src={item.ogImage}
                  alt={item.title ?? 'Article Thumbnail'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}

            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.status === 'COMPLETED' ? 'default' : 'secondary'
                  }
                >
                  {item.status.toLowerCase()}
                </Badge>
                <Button
                  onClick={async (e) => {
                    e.preventDefault()
                    await copyToClipboard(item.url)
                  }}
                  variant={'outline'}
                  size={'icon'}
                  className="size-8"
                >
                  <Copy className="size-4" />
                </Button>
              </div>

              <CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors">
                {item.title ?? 'Article Title'}
              </CardTitle>
              {item.author && (
                <p className="text-xs text-muted-foreground">{item.author}</p>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData()
  const { status, query } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(query)

  const navigate = useNavigate({ from: Route.fullPath })

  useEffect(() => {
    if (searchInput === query) return

    const timeout = setTimeout(() => {
      navigate({
        search: (prev) => ({
          ...prev,
          query: searchInput,
        }),
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchInput, query, navigate])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">
          Your collection of saved articles and resources.
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by title or tags"
          className=""
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                status: value as typeof status,
              }),
            })
          }
        >
          <SelectTrigger className="w-[160px">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ItemList query={query} status={status} data={itemsPromise} />
    </div>
  )
}
