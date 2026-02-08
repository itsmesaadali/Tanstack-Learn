import { scrapeUrlAction } from "@/app/actions/scrape-url";
import { importSchema } from "@/app/schemas/import";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const SingleFiles = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      url: "",
    },
  });

  function onSubmit(data: z.infer<typeof importSchema>) {
    startTransition(async () => {
      await scrapeUrlAction(data);
      toast.success("URL scraped successfully!");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Single File</CardTitle>
        <CardDescription>
          Scrape and save content from any web app!
        </CardDescription>
      </CardHeader>
      <CardContent>
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

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                "Import URL"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
