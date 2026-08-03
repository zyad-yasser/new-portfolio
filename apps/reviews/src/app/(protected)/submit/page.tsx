"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Loader2, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Review is required").max(2000),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export default function SubmitReviewPage() {
  const router = useRouter();
  const utils = publicApi.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: "", body: "" },
  });

  const createReview = publicApi.review.create.useMutation({
    onSuccess: async () => {
      setSubmitted(true);
      await utils.review.list.invalidate();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  async function onSubmit(values: ReviewValues) {
    setError(null);
    createReview.mutate(values);
  }

  async function handleSignOut() {
    await publicAuthClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const rating = form.watch("rating");

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 p-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
          &larr; Back to reviews
        </Link>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave a review</CardTitle>
          <CardDescription>Share your experience working with Zyad Yasser.</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-muted-foreground">
              Thanks for your review!{" "}
              <Link href="/" className="font-medium text-foreground underline underline-offset-4">
                View all reviews
              </Link>
            </p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`${value} star${value === 1 ? "" : "s"}`}
                          onClick={() => form.setValue("rating", value, { shouldValidate: true })}
                        >
                          <Star
                            className={
                              value <= rating
                                ? "size-6 fill-primary text-primary"
                                : "size-6 text-muted-foreground"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Great to work with" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Tell others about your experience"
                          {...field}
                        />
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

                <Button type="submit" className="w-full gap-2" disabled={createReview.isPending}>
                  {createReview.isPending && <Loader2 className="size-4 animate-spin" />}
                  {createReview.isPending ? "Submitting..." : "Submit review"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
