"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function BlockedUsersPage() {
  const utils = publicApi.useUtils();
  const { data: blocked, isLoading } = publicApi.block.list.useQuery();

  const unblock = publicApi.block.unblock.useMutation({
    onSuccess: () => utils.block.list.invalidate(),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold">Blocked users</h1>

        {isLoading && <Skeleton className="h-24 w-full" />}
        {!isLoading && blocked?.length === 0 && (
          <p className="text-muted-foreground">You haven't blocked anyone.</p>
        )}

        <div className="flex flex-col gap-3">
          {blocked?.map((blockedUser) => (
            <Card
              key={blockedUser.id}
              className="flex flex-row items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarImage src={blockedUser.image ?? undefined} alt={blockedUser.name} />
                  <AvatarFallback>{initialsFor(blockedUser.name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{blockedUser.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={unblock.isPending}
                onClick={() => unblock.mutate({ userId: blockedUser.id })}
              >
                Unblock
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
