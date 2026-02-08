import { BulkScrapeProgess, startBulkScrapeAction } from "@/app/actions/bulk-scrape";
import { mapUrlAction } from "@/app/actions/map-url";
import { bulkImportSchema } from "@/app/schemas/import";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchResultWeb } from "@mendable/firecrawl-js";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const BulkFiles = () => {

  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<BulkScrapeProgess | null>(null);

  // bulk import state

  const [discoveredLinks, setDiscoveredLinks] = useState<
    Array<SearchResultWeb>
  >([]);

  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  function handleSelectAll() {
    if (selectedUrls.size === discoveredLinks.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)));
    }
  }

  function handleToggleUrl(url: string) {
    const newSelectedUrls = new Set(selectedUrls);
    if (newSelectedUrls.has(url)) {
      newSelectedUrls.delete(url);
    } else {
      newSelectedUrls.add(url);
    }
    setSelectedUrls(newSelectedUrls);
  }

  function handleImportSelected() {
    startTransition(async () => {
      if (selectedUrls.size === 0) {
        toast.error("Please select at least one URL to import.");
        return;
      }

      setProgress({
        completed: 0,
        total: selectedUrls.size,
        url: "",
        status: "success",
      });

      let successCount = 0;
      let failedCount = 0;

      const result = await startBulkScrapeAction({
        urls: Array.from(selectedUrls),
      });

      if (result && result.success) {
        successCount = selectedUrls.size;
      } else {
        failedCount = selectedUrls.size;
      }

      setProgress(null);
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} items.`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} items.`);
      }
    });
  }

  const form = useForm<z.infer<typeof bulkImportSchema>>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      url: "",
      search: "",
    },
  });

  function onSubmit(data: z.infer<typeof bulkImportSchema>) {
    startTransition(async () => {
      const result = await mapUrlAction(data);
      setDiscoveredLinks(result);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk File Import</CardTitle>
        <CardDescription>
          Import multiple files simultaneously for streamlined content
          management.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-url">URL</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-url"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://example.com"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="search"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-search">Search</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-search"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g Blog, Article, News, etc."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Importing: {progress.completed} / {progress.total}
                  </span>
                  <span className="font-medium">
                    {Math.round((progress.completed / progress.total) * 100)}%
                  </span>
                </div>

                <Progress value={(progress.completed / progress.total) * 100} />
              </div>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner />
                  {progress
                    ? ` Importing (${progress.completed}/${progress.total})`
                    : "Importing..."}
                </>
              ) : (
                "Import URLs"
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
              <Button variant={"outline"} size={"sm"} onClick={handleSelectAll}>
                {selectedUrls.size === discoveredLinks.length
                  ? "Deselect All"
                  : "Select All"}
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
                      {link.title ?? "Title has not been found"}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {link.description ?? "Description has not been found"}
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
              disabled={isPending}
              type="button"
            >
              {isPending ? (
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
  );
};
