"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfileSettingsPage() {
  const utils = publicApi.useUtils();
  const { data: profile, isLoading } = publicApi.profile.mine.useQuery();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBio(profile.bio ?? "");
      setWebsiteUrl(profile.websiteUrl ?? "");
      setLocation(profile.location ?? "");
    }
  }, [profile]);

  const update = publicApi.profile.update.useMutation({
    onSuccess: async (updated) => {
      setError(null);
      setSaved(true);
      await utils.profile.mine.invalidate();
      if (updated?.username) {
        await utils.profile.getByUsername.invalidate({ username: updated.username });
      }
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    update.mutate({ username, bio, websiteUrl, location });
  }

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
          <Skeleton className="h-64 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Profile settings</CardTitle>
            <CardDescription>Shown on your public profile page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  maxLength={280}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button type="submit" disabled={update.isPending} className="gap-2">
                {update.isPending && <Loader2 className="size-4 animate-spin" />}
                {saved ? "Saved" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
