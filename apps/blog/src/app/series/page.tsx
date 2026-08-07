"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { Library } from "lucide-react";
import Link from "next/link";

export default function SeriesIndexPage() {
  const { data: seriesList, isLoading, error, refetch } = publicApi.series.list.useQuery();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Series</h1>
          <p className="text-muted-foreground">Multi-part posts, grouped and in order.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}

          {error && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
              <p>Couldn't load series. {error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && seriesList?.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No series yet.</p>
          )}

          {seriesList?.map((s) => (
            <Link key={s.id} href={`/series/${s.slug}`}>
              <Card className="flex h-full flex-col gap-2 border-border/60 p-5 transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center gap-2 p-0">
                  <Library className="size-4 shrink-0 text-muted-foreground" />
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 p-0">
                  {s.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                  )}
                  <span className="mt-auto text-xs text-muted-foreground">
                    {s.author.name} · {s.postCount} {s.postCount === 1 ? "post" : "posts"}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
