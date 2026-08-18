"use client";

import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { Laptop, Loader2, LogOut, Smartphone } from "lucide-react";
import { toast } from "sonner";

function deviceLabel(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown device";
  }

  const os = userAgent.includes("iPhone")
    ? "iOS"
    : userAgent.includes("Android")
      ? "Android"
      : userAgent.includes("Mac OS X")
        ? "macOS"
        : userAgent.includes("Windows")
          ? "Windows"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Unknown OS";

  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Chrome/")
      ? "Chrome"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Unknown browser";

  return `${browser} on ${os}`;
}

function isMobile(userAgent: string | null) {
  return !!userAgent && /iPhone|Android/.test(userAgent);
}

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SessionsSettingsPage() {
  const utils = publicApi.useUtils();
  const { data: sessions, isLoading, error, refetch } = publicApi.session.list.useQuery();

  const revoke = publicApi.session.revoke.useMutation({
    onSuccess: () => {
      utils.session.list.invalidate();
      toast.success("Session revoked.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't revoke this session.")),
  });

  const revokeOthers = publicApi.session.revokeOthers.useMutation({
    onSuccess: () => {
      utils.session.list.invalidate();
      toast.success("Signed out of other devices.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't sign out other devices.")),
  });

  const hasOtherSessions = (sessions?.length ?? 0) > 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Devices currently signed in to your account.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!hasOtherSessions || revokeOthers.isPending}
          onClick={() => revokeOthers.mutate()}
        >
          {revokeOthers.isPending && <Loader2 className="size-4 animate-spin" />}
          Sign out of other devices
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="skeleton-shimmer h-20 w-full" />
          <Skeleton className="skeleton-shimmer h-20 w-full" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p>Couldn't load your sessions. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sessions?.map((session) => {
          const DeviceIcon = isMobile(session.userAgent) ? Smartphone : Laptop;
          return (
            <Card key={session.id} className="flex flex-row items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <DeviceIcon className="size-4 text-muted-foreground" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{deviceLabel(session.userAgent)}</span>
                    {session.isCurrent && <Badge variant="secondary">This device</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {session.ipAddress ? `${session.ipAddress} · ` : ""}
                    Active since {formatDateTime(session.createdAt)}
                  </span>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate({ token: session.token })}
                >
                  <LogOut className="size-3.5" />
                  Revoke
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
