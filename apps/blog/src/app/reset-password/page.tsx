"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthErrorMessage } from "@repo/auth/error-message";
import { publicAuthClient } from "@repo/auth/public-client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { PasswordInput } from "@repo/ui/password-input";
import { Skeleton } from "@repo/ui/skeleton";
import type { ResetPasswordValues } from "@repo/utils/schemas/password";
import { resetPasswordSchema } from "@repo/utils/schemas/password";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      return;
    }

    const { error } = await publicAuthClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      toast.error(getAuthErrorMessage(error, "Couldn't reset your password. Request a new link."));
      return;
    }

    toast.success("Password updated. You can log in now.");
    router.push("/login");
  }

  if (!token || tokenError) {
    return (
      <Card className="glass w-full max-w-sm shadow-xl shadow-black/5">
        <CardHeader>
          <CardTitle className="text-2xl">Link expired</CardTitle>
          <CardDescription>
            This password reset link is invalid or has already been used. Reset links expire one
            hour after they're sent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="btn-glow w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="glass w-full max-w-sm shadow-xl shadow-black/5">
      <CardHeader>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <CardDescription>Pick something you haven't used here before.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="btn-glow w-full gap-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ResetPasswordFallback() {
  return (
    <Card className="glass w-full max-w-sm shadow-xl shadow-black/5">
      <CardHeader>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="skeleton-shimmer h-10 w-full rounded-md" />
        <Skeleton className="skeleton-shimmer h-10 w-full rounded-md" />
        <Skeleton className="skeleton-shimmer h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
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
        <span className="text-lg font-semibold">Zyad Yasser Blog</span>
      </div>

      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>

      <p className="text-xs text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to login
        </Link>
      </p>
    </main>
  );
}
