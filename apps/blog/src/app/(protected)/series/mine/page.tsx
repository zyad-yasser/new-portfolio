"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SeriesFormValues = { title: string; description: string };

function SeriesFormDialog({
  trigger,
  title,
  initial,
  onSubmit,
  isPending,
}: {
  trigger: React.ReactNode;
  title: string;
  initial?: SeriesFormValues;
  onSubmit: (values: SeriesFormValues) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SeriesFormValues>(initial ?? { title: "", description: "" });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setValues(initial ?? { title: "", description: "" });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="series-form-title">Title</Label>
            <Input
              id="series-form-title"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="series-form-description">Description</Label>
            <Textarea
              id="series-form-description"
              rows={3}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!values.title.trim() || isPending}
            onClick={() => {
              onSubmit(values);
              setOpen(false);
            }}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MySeriesPage() {
  const utils = publicApi.useUtils();
  const { data: seriesList, isLoading, error, refetch } = publicApi.series.mine.useQuery();

  const createSeries = publicApi.series.create.useMutation({
    onSuccess: () => utils.series.mine.invalidate(),
  });
  const updateSeries = publicApi.series.update.useMutation({
    onSuccess: () => utils.series.mine.invalidate(),
  });
  const deleteSeries = publicApi.series.delete.useMutation({
    onSuccess: () => utils.series.mine.invalidate(),
  });
  const reorder = publicApi.series.reorder.useMutation({
    onSuccess: () => utils.series.mine.invalidate(),
  });

  function movePost(seriesId: string, postIds: string[], index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= postIds.length) {
      return;
    }
    const next = [...postIds];
    const moved = next[index];
    const swapped = next[target];
    if (moved === undefined || swapped === undefined) {
      return;
    }
    next[index] = swapped;
    next[target] = moved;
    reorder.mutate({ seriesId, postIds: next });
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">My series</h1>
          <SeriesFormDialog
            trigger={
              <Button size="sm" className="btn-glow gap-2">
                <Plus className="size-4" />
                New series
              </Button>
            }
            title="New series"
            isPending={createSeries.isPending}
            onSubmit={(values) =>
              createSeries.mutate({ title: values.title, description: values.description || null })
            }
          />
        </div>

        <div className="flex flex-col gap-4">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="skeleton-shimmer h-32 w-full rounded-lg" />
            ))}

          {error && (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <p>Couldn't load your series. {error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && seriesList?.length === 0 && (
            <p className="text-muted-foreground">
              You haven't created a series yet. Group related posts together with one.
            </p>
          )}

          {seriesList?.map((s) => {
            const postIds = s.posts.map((p) => p.id);
            return (
              <Card key={s.id} className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="text-base">
                    <Link href={`/series/${s.slug}`} className="hover:underline">
                      {s.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <SeriesFormDialog
                      trigger={
                        <Button variant="outline" size="sm" className="gap-1">
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                      }
                      title="Edit series"
                      initial={{ title: s.title, description: s.description ?? "" }}
                      isPending={updateSeries.isPending}
                      onSubmit={(values) =>
                        updateSeries.mutate({
                          id: s.id,
                          title: values.title,
                          description: values.description || null,
                        })
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive"
                          aria-label={`Delete "${s.title}"`}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{s.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This can't be undone. Posts in this series will be unassigned, not
                            deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteSeries.isPending}
                            onClick={() => deleteSeries.mutate({ id: s.id })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {s.description && (
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  )}

                  {s.posts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No posts assigned yet.</p>
                  ) : (
                    <ol className="flex flex-col gap-1.5">
                      {s.posts.map((post, index) => (
                        <li
                          key={post.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2.5 py-1.5 text-sm"
                        >
                          <Link href={`/post/${post.slug}`} className="truncate hover:underline">
                            {index + 1}. {post.title}
                          </Link>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              disabled={index === 0 || reorder.isPending}
                              aria-label="Move up"
                              onClick={() => movePost(s.id, postIds, index, -1)}
                            >
                              <ArrowUp className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              disabled={index === s.posts.length - 1 || reorder.isPending}
                              aria-label="Move down"
                              onClick={() => movePost(s.id, postIds, index, 1)}
                            >
                              <ArrowDown className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
