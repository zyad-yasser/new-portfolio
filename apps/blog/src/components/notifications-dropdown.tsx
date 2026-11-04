"use client";

import {
  NOTIFICATION_TYPE_ICON,
  initialsFor,
  notificationHref,
  notificationText,
} from "@/lib/notifications";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function NotificationsDropdown({ unreadCount }: { unreadCount: number | undefined }) {
  const [open, setOpen] = useState(false);
  const utils = publicApi.useUtils();

  const { data, isLoading } = publicApi.notification.list.useQuery({ limit: 5 }, { enabled: open });
  const notifications = data?.items;
  const hasUnread = notifications?.some((n) => !n.readAt) ?? false;

  const markRead = publicApi.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update this notification.")),
  });

  const markAllRead = publicApi.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't mark notifications as read.")),
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {!!unreadCount && (
            <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong w-80 rounded-xl p-0 shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-2.5">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="skeleton-shimmer m-1 h-14 rounded-lg" />
            ))}

          {!isLoading && notifications?.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <BellOff className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You're all caught up.</p>
            </div>
          )}

          {notifications?.map((n) => {
            const Icon = NOTIFICATION_TYPE_ICON[n.type];
            return (
              <Link
                key={n.id}
                href={notificationHref(n)}
                onClick={() => {
                  setOpen(false);
                  if (!n.readAt) {
                    markRead.mutate({ id: n.id });
                  }
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg p-2 text-sm hover:bg-accent",
                  !n.readAt && "bg-accent/50"
                )}
              >
                <Avatar size="sm" className="shrink-0">
                  <AvatarImage src={n.actor?.image ?? undefined} alt={n.actor?.name ?? ""} />
                  <AvatarFallback>{n.actor ? initialsFor(n.actor.name) : "?"}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate">{notificationText(n)}</span>
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border/60 p-1.5">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-lg py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
