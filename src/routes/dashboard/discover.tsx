import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { bulkScrapeFn, BulkScrapeProgess, searchWebFn } from '@/data/items'
import { searchSchema } from '@/schemas/import'
import { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/dashboard/discover')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [bulkIsPending, startBulkTransition] = useTransition()

  const [searchResults, setSearchResults] = useState<Array<SearchResultWeb>>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())

  const [progress, setProgress] = useState<BulkScrapeProgess | null>(null)

  function handleSelectAll() {
    if (selectedUrls.size === searchResults.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(searchResults.map((link) => link.url)))
    }
  }

  function handleToggleUrl(url: string) {
    const newSelectedUrls = new Set(selectedUrls)
    if (newSelectedUrls.has(url)) {
      newSelectedUrls.delete(url)
    } else {
      newSelectedUrls.add(url)
    }
    setSelectedUrls(newSelectedUrls)
  }

  function handleImportSelected() {
    startBulkTransition(async () => {
      if (selectedUrls.size === 0) {
        toast.error('Please select at least one URL to import.')
        return
      }

      setProgress({
        completed: 0,
        total: selectedUrls.size,
        url: '',
        status: 'success',
      })

      let successCount = 0
      let failedCount = 0

      for await (const update of await bulkScrapeFn({
        data: { urls: Array.from(selectedUrls) },
      })) {
        setProgress(update)

        if (update.status === 'success') {
          successCount++
        } else {
          failedCount++
        }
      }

      setProgress(null)
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} items.`)
      }
      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} items.`)
      }
    })
  }

  const form = useForm({
    defaultValues: {
      query: '',
    },
    validators: {
      onSubmit: searchSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const results = await searchWebFn({ data: { query: value.query } })
        setSearchResults(results)
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold ">Discover</h1>
          <p className="text-muted-foreground pt-1">
            Search the web for articles on various topics.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Topic Search
            </CardTitle>
            <CardDescription>
              Explore articles on different subjects by searching the web.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field
                  name="query"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Query</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter your search query"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Spinner /> Searching...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" /> Search Web
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Found {searchResults.length} links
                  </p>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    onClick={handleSelectAll}
                  >
                    {selectedUrls.size === searchResults.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>
                {/* {hide the scrollbar} */}
                <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4 scrollbar-none">
                  {searchResults.map((link) => (
                    <label
                      key={link.url}
                      className="hover:bg-accent/50 flex items-start gap-2 rounded-md p-2 cursor-pointer"
                    >
                      <Checkbox
                        className="mt-0.5"
                        checked={selectedUrls.has(link.url)}
                        onCheckedChange={() => handleToggleUrl(link.url)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {link.title ?? 'Title has not been found'}
                        </p>
                        <p className="truncate text-muted-foreground text-xs">
                          {link.description ?? 'Description has not been found'}
                        </p>
                        <p className="truncate text-muted-foreground text-xs">
                          {link.url}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Importing: {progress.completed} / {progress.total}
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          (progress.completed / progress.total) * 100,
                        )}
                        %
                      </span>
                    </div>

                    <Progress
                      value={(progress.completed / progress.total) * 100}
                    />
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleImportSelected}
                  disabled={bulkIsPending}
                  type="button"
                >
                  {bulkIsPending ? (
                    <>
                      <Spinner />
                      {progress
                        ? ` Importing (${progress.completed}/${progress.total})`
                        : 'Importing...'}
                    </>
                  ) : (
                    `Import ${selectedUrls.size} Selected URLs`
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
