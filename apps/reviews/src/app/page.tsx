"use client";

import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { Star } from "lucide-react";
import Link from "next/link";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ReviewsPage() {
  const { data: reviews, isLoading } = publicApi.review.list.useQuery();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-6 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold">Client reviews</h1>
        <p className="text-muted-foreground">What people say about working with Zyad Yasser.</p>
        <div className="mt-2">
          <Button asChild>
            <Link href="/submit">Leave a review</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}

        {!isLoading && reviews?.length === 0 && (
          <p className="text-center text-muted-foreground">No reviews yet - be the first.</p>
        )}

        {reviews?.map((review) => (
          <Card key={review.id}>
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar className="h-10 w-10">
                {review.authorImage && (
                  <AvatarImage src={review.authorImage} alt={review.authorName} />
                )}
                <AvatarFallback>{initialsOf(review.authorName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base">{review.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{review.authorName}</p>
              </div>
              <div
                className="flex shrink-0 items-center gap-0.5"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < review.rating
                        ? "size-4 fill-primary text-primary"
                        : "size-4 text-muted-foreground"
                    }
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{review.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
