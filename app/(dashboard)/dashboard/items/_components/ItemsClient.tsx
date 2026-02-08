"use client";

import { Copy, Inbox } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { copyToClipboard } from "@/lib/clipboard";
import Image from "next/image";

type Props = {
  items: any[];
};

export default function ItemsClient({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="border rounded-lg p-10 text-center">
        <Inbox className="mx-auto size-14 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No saved items</h2>
        <p className="text-muted-foreground">
          Import links to see them here.
        </p>

        <Link
          href="/dashboard/import"
          className="mt-4 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Import Items
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const imageUrl =
          item.ogImage ??
          `https://openplaceholder.com/600x400/${encodeURIComponent(
            item.title ?? "Saved Item"
          )}`;

        return (
          <Card
            key={item.id}
            className="group overflow-hidden transition-shadow hover:shadow-lg"
          >
            <Link href={`/dashboard/items/${item.id}`}>
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <Image
                  src={imageUrl}
                  alt={item.title ?? "Saved item"}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
                />
              </div>

              {/* Content */}
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusVariant(
                      item.status
                    )}`}
                  >
                    {item.status.toLowerCase()}
                  </span>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      copyToClipboard(item.url);
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>

                <CardTitle className="line-clamp-2 text-base">
                  {item.title ?? "Untitled"}
                </CardTitle>

                {item.summary && (
                  <CardDescription className="line-clamp-3 text-sm">
                    {item.summary}
                  </CardDescription>
                )}
              </CardHeader>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}

function statusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200";
    case "FAILED":
      return "bg-red-100 text-red-700 border-red-200";
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "PENDING":
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}
