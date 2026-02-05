import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Sparkles,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { toast } from 'sonner'
import { MessageResponse } from '@/components/ai-elements/message'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { getItemById, saveSummaryAndGenerateTagsFn } from '@/data/items'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemById({ data: { id: params.itemId } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ?? 'Item Details' },
      { property: 'og:title', content: loaderData?.ogImage ?? 'Item Details' },
      { name: 'twitter:title', content: loaderData?.title ?? 'Item Details' },
    ],
  }),
})

function RouteComponent() {
  const data = Route.useLoaderData()

  const [contentOpen, setContentOpen] = useState(false)
  const router = useRouter()

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/summary',
    initialCompletion: data.summary ? data.summary : 'undefined',
    streamProtocol: 'text',
    body: {
      itemId: data.id,
    },
    onFinish: async (_prompt, completionText) => {
      await saveSummaryAndGenerateTagsFn({
        data: { id: data.id, summary: completionText },
      })

      toast.success('Summary generated and saved successfully!')
      router.invalidate()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  function handleGenerateSummary() {
    if (!data.content) {
      toast.error('No content available to summarize.')
      return
    }
    complete(data.content)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 w-full">
      <div className="flex justify-start ">
        <Link
          to="/dashboard/items"
          className={buttonVariants({ variant: 'outline' })}
        >
          <ArrowLeft />
          Go Back
        </Link>
      </div>

      {data.ogImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          <img
            src={data.ogImage}
            alt={data.title ?? 'Item Image'}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {data.title ?? 'Untitled'}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {data.author && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" /> {data.author}
            </span>
          )}

          {data.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />{' '}
              {new Date(data.publishedAt).toLocaleDateString()}
            </span>
          )}

          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> Saved{' '}
            {new Date(data.createdAt).toLocaleDateString()}
          </span>
        </div>

        <a
          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
          target="_blank"
          href={data.url}
        >
          View Original
          <ExternalLink className="size-3.5" />
        </a>

        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge>{tag}</Badge>
            ))}
          </div>
        )}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent>
            <div className="relative">
              {/* Button stays fixed */}
              {data.content && !data.summary && (
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={handleGenerateSummary}
                  className="absolute right-0 top-0"
                >
                  {isLoading ? (
                    <>
                      <Spinner /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles /> Generate Summary
                    </>
                  )}
                </Button>
              )}

              {/* Summary content */}
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                  AI Summary
                </h2>

                {completion || data.summary ? (
                  <MessageResponse>{completion}</MessageResponse>
                ) : (
                  <p className="italic text-muted-foreground">
                    {data.content
                      ? 'No summary available. Generate one with AI.'
                      : 'No content available.'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {data.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant={'outline'} className="w-full justify-between">
                <span className="text-medium">Read Full Content</span>
                <ChevronDown className={cn({ 'rotate-180': contentOpen })} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent>
                  <MessageResponse>{data.content}</MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
