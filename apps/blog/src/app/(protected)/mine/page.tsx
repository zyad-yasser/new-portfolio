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
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export default function MinePostsPage() {
  const utils = publicApi.useUtils();
  const { data: posts, isLoading } = publicApi.post.mine.useQuery();

  const setPublished = publicApi.post.setPublished.useMutation({
    onSuccess: async () => {
      await utils.post.mine.invalidate();
      await utils.post.list.invalidate();
    },
  });

  const deletePost = publicApi.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.mine.invalidate();
      await utils.post.list.invalidate();
    },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold">My posts</h1>

        <div className="flex flex-col gap-4">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}

          {!isLoading && posts?.length === 0 && (
            <p className="text-muted-foreground">
              You haven't written anything yet.{" "}
              <Link
                href="/new"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Write your first post
              </Link>
            </p>
          )}

          {posts?.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-base">
                  <Link href={`/post/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <Badge variant={post.published ? "default" : "outline"}>
                  {post.published ? "Published" : "Draft"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={setPublished.isPending}
                    onClick={() => setPublished.mutate({ id: post.id, published: !post.published })}
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link href={`/post/${post.slug}/edit`}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 text-destructive">
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{post.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This can't be undone. The post will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deletePost.isPending}
                          onClick={() => deletePost.mutate({ id: post.id })}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
