"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  content: z.string().trim().min(1, "Content is required").max(20000),
});

type PostValues = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const utils = publicApi.useUtils();
  const [error, setError] = useState<string | null>(null);

  const { data: posts, isLoading } = publicApi.post.mine.useQuery();
  const post = posts?.find((p) => p.slug === slug);

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "" },
  });

  useEffect(() => {
    if (post) {
      form.reset({ title: post.title, content: post.content });
    }
  }, [post, form]);

  const updatePost = publicApi.post.update.useMutation({
    onSuccess: async (updated) => {
      await utils.post.mine.invalidate();
      await utils.post.list.invalidate();
      await utils.post.getBySlug.invalidate({ slug: updated.slug });
      router.push("/mine");
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  async function onSubmit(values: PostValues) {
    if (!post) return;
    setError(null);
    updatePost.mutate({ id: post.id, ...values });
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-16">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <Button asChild variant="outline">
          <Link href="/mine">Back to my posts</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-16">
      <Link href="/mine" className="text-sm text-muted-foreground underline underline-offset-4">
        &larr; My posts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit post</CardTitle>
          <CardDescription>Changes save immediately once submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea rows={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={updatePost.isPending}>
                {updatePost.isPending && <Loader2 className="size-4 animate-spin" />}
                {updatePost.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
