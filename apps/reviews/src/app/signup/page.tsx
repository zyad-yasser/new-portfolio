"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { publicAuthClient } from "@repo/auth/public-client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { GoogleIcon } from "@repo/ui/icons";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@repo/ui/password-input";
import { Turnstile } from "@repo/ui/turnstile";
import { Github, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

const POST_SIGNUP_PATH = "/submit";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [socialProvider, setSocialProvider] = useState<"google" | "github" | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the verification.");
      return;
    }

    const { error: signUpError } = await publicAuthClient.signUp.email(values, {
      headers: { "x-captcha-response": turnstileToken },
    });

    setTurnstileToken(null);
    setTurnstileKey((key) => key + 1);

    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create your account.");
      return;
    }

    router.push(POST_SIGNUP_PATH);
    router.refresh();
  }

  async function onSocialSignIn(provider: "google" | "github") {
    setError(null);
    setSocialProvider(provider);

    const { error: signInError } = await publicAuthClient.signIn.social({
      provider,
      callbackURL: POST_SIGNUP_PATH,
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
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          ZY
        </span>
        <span className="text-lg font-semibold">Zyad Yasser Reviews</span>
      </div>

      <Card className="w-full max-w-sm border-border/60 shadow-xl shadow-black/5">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Sign up to leave a review</CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" autoComplete="name" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Turnstile
                key={turnstileKey}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
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
                className="w-full gap-2"
                disabled={isSubmitting || !turnstileToken || isSocialLoading}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </main>
  );
}
