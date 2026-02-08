"use client";

import { GlobeIcon, Link2Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleFiles } from "./_components/SingleFiles";
import { BulkFiles } from "./_components/BulkFiles";

export default function ImportPage() {
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
            <SingleFiles />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkFiles />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
