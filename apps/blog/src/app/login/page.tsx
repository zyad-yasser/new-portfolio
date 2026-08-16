"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { publicAuthClient } from "@repo/auth/public-client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { GoogleIcon } from "@repo/ui/icons";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@repo/ui/password-input";
import { Github, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const POST_LOGIN_PATH = "/mine";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [socialProvider, setSocialProvider] = useState<"google" | "github" | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);

    const { error: signInError } = await publicAuthClient.signIn.email(values);

    if (signInError) {
      setError(signInError.message ?? "Invalid email or password.");
      return;
    }

    router.push(POST_LOGIN_PATH);
    router.refresh();
  }

  async function onSocialSignIn(provider: "google" | "github") {
    setError(null);
    setSocialProvider(provider);

    const { error: signInError } = await publicAuthClient.signIn.social({
      provider,
      callbackURL: POST_LOGIN_PATH,
    });

    if (signInError) {
      setError(signInError.message ?? "Couldn't sign in.");
      setSocialProvider(null);
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const isSocialLoading = socialProvider !== null;

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

      <Card className="glass w-full max-w-sm shadow-xl shadow-black/5">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Log in to write or manage your posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={isSocialLoading}
              onClick={() => onSocialSignIn("google")}
            >
              {socialProvider === "google" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon className="size-4" />
              )}
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={isSocialLoading}
              onClick={() => onSocialSignIn("github")}
            >
              {socialProvider === "github" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Github className="size-4" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            Or continue with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Remember me</FormLabel>
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
              <Button
                type="submit"
                className="btn-glow w-full gap-2"
                disabled={isSubmitting || isSocialLoading}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </main>
  );
}
