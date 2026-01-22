export const serverRuntime = 'node'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  bulkScrapeFn,
  BulkScrapeProgess,
  mapUrlFn,
  scrapeUrlFn,
} from '@/data/items'
import { bulkImportSchema, importSchema } from '@/schemas/import'
import { type SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, Link2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [bulkIsPending, startBulkTransition] = useTransition()
  const [progress, setProgress] = useState<BulkScrapeProgess | null>(null)

  // bulk import state

  const [discoveredLinks, setDiscoveredLinks] = useState<
    Array<SearchResultWeb>
  >([])

  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())

  function handleSelectAll() {
    if (selectedUrls.size === discoveredLinks.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)))
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

  // forms

  const signleForm = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await scrapeUrlFn({
          data: value,
        })
        toast.success('URL scraped successfully!')
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    },
    validators: {
      onSubmit: bulkImportSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const data = await mapUrlFn({
          data: value,
        })
        setDiscoveredLinks(data)
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold ">Import Content</h1>
          <p className="text-muted-foreground pt-1">
            Save your content by importing files here for later use.
          </p>
        </div>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <Link2Icon className="size-4" />
              Single File
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <GlobeIcon className="size-4" />
              Bulk Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import Single File</CardTitle>
                <CardDescription>
                  Scrape and save content from any web app!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    signleForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <signleForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
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
                          <Spinner />
                          Processing...
                        </>
                      ) : (
                        'Import URL'
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk File Import</CardTitle>
                <CardDescription>
                  Import multiple files simultaneously for streamlined content
                  management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />

                    <bulkForm.Field
                      name="search"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Filter (optional)
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g Blog, Article, News, etc."
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />

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

                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Spinner />
                          {progress
                            ? ` Importing (${progress.completed}/${progress.total})`
                            : 'Importing...'}
                        </>
                      ) : (
                        'Import URLs'
                      )}
                    </Button>
                  </FieldGroup>
                </form>

                {/* Discovered URLS list */}

                {discoveredLinks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Found {discoveredLinks.length} links
                      </p>
                      <Button
                        variant={'outline'}
                        size={'sm'}
                        onClick={handleSelectAll}
                      >
                        {selectedUrls.size === discoveredLinks.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>
                    {/* {hide the scrollbar} */}
                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4 scrollbar-none">
                      {discoveredLinks.map((link) => (
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
                              {link.description ??
                                'Description has not been found'}
                            </p>
                            <p className="truncate text-muted-foreground text-xs">
                              {link.url}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleImportSelected}
                      disabled={bulkIsPending}
                      type="button"
                    >
                      {bulkIsPending ? (
                        <>
                          <Spinner />
                          Importing...
                        </>
                      ) : (
                        `Import ${selectedUrls.size} Selected URLs`
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
