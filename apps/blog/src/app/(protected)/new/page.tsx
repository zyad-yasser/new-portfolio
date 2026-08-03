"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  content: z.string().trim().min(1, "Content is required").max(20000),
});

type PostValues = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const utils = publicApi.useUtils();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "" },
  });

  const createPost = publicApi.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.list.invalidate();
      await utils.post.mine.invalidate();
      router.push("/mine");
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  async function onSubmit(values: PostValues) {
    setError(null);
    createPost.mutate({ ...values, published: true });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-16">
      <Link href="/mine" className="text-sm text-muted-foreground underline underline-offset-4">
        &larr; My posts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Write a post</CardTitle>
          <CardDescription>Published immediately once submitted.</CardDescription>
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

              <Button type="submit" className="w-full gap-2" disabled={createPost.isPending}>
                {createPost.isPending && <Loader2 className="size-4 animate-spin" />}
                {createPost.isPending ? "Publishing..." : "Publish"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
