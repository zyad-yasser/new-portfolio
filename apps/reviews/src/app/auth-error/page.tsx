"use client";

import { getOAuthErrorContent } from "@repo/auth/oauth-error-message";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorCard() {
  const searchParams = useSearchParams();
  const content = getOAuthErrorContent(searchParams.get("error"));

  return (
    <Card className="glass w-full max-w-md shadow-xl shadow-black/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle className="size-5 text-amber-500" />
          {content.title}
        </CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild className="btn-glow w-full">
          <Link href="/login">{content.canRetry ? "Try again" : "Log in with email"}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/forgot-password">Forgot your password?</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AuthErrorFallback() {
  return (
    <Card className="glass w-full max-w-md shadow-xl shadow-black/5">
      <CardHeader>
        <CardTitle className="text-2xl">Sign-in failed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="skeleton-shimmer h-4 w-full rounded" />
        <Skeleton className="skeleton-shimmer h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]"
      />

      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-primary-foreground">
          ZY
        </span>
        <span className="text-lg font-semibold">Zyad Yasser Reviews</span>
      </div>

      <Suspense fallback={<AuthErrorFallback />}>
        <AuthErrorCard />
      </Suspense>
    </main>
  );
}
