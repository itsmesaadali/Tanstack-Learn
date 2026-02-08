'use client'

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
import { saveSummaryActionAndGenTags } from '@/app/actions/save-summary'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Props = {
  data: any
}

export default function ItemDetailClient({ data }: Props) {
  const [contentOpen, setContentOpen] = useState(false)
  const router = useRouter()

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/summary',
    initialCompletion: data.summary ?? '',
    onFinish: async (_prompt, text) => {
      if (!text.trim()) {
        toast.error('AI returned empty summary')
        return
      }

      await saveSummaryActionAndGenTags({ id: data.id, summary: text })
      toast.success('Summary & tags saved')
      router.refresh()
    },
    onError: (e) => {
      toast.error(e.message)
      console.error(e)
    },
  })

  function handleGenerateSummary() {
    if (!data.content) {
      toast.error('No content available')
      return
    }

    // ✅ pass the content directly as the prompt
    complete(data.content)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 w-full">
      <Link
        href="/dashboard/items"
        className={buttonVariants({ variant: 'outline' })}
      >
        <ArrowLeft /> Go Back
      </Link>

      {data.ogImage && (
        <div className="relative aspect-video overflow-hidden rounded-md">
          <img
            src={data.ogImage}
            alt={data.title ?? 'Item image'}
            className="h-full w-full object-cover transition hover:scale-105"
          />
        </div>
      )}

      <h1 className="text-2xl font-bold">{data.title ?? 'Untitled'}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {data.author && (
          <span className="flex items-center gap-1">
            <User className="size-3.5" /> {data.author}
          </span>
        )}
        {data.publishedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(data.publishedAt).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          Saved {new Date(data.createdAt).toLocaleDateString()}
        </span>
      </div>

      <a
        href={data.url}
        target="_blank"
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        View Original <ExternalLink className="size-4" />
      </a>

      {data.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {data.tags.map((tag: string) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="relative">
          {!data.summary && data.content && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={handleGenerateSummary}
              className="absolute right-4 top-4"
            >
              {isLoading ? <Spinner /> : <Sparkles />}
              Generate Summary
            </Button>
          )}

          <h2 className="mb-2 text-sm font-semibold text-primary">
            AI Summary
          </h2>

          {completion || data.summary ? (
            <MessageResponse>
              {completion || data.summary}
            </MessageResponse>
          ) : (
            <p className="italic text-muted-foreground">No summary yet.</p>
          )}
        </CardContent>
      </Card>

      {data.content && (
        <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Read Full Content
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
  )
}
