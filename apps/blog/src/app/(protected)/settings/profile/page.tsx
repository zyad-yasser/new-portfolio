"use client";

import { AvatarUpload } from "@/components/settings/avatar-upload";
import { initialsFor } from "@/lib/notifications";
import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const utils = publicApi.useUtils();
  const { data: session } = publicAuthClient.useSession();
  const { data: profile, isLoading, error: loadError, refetch } = publicApi.profile.mine.useQuery();

  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (session?.user.name) {
      setName(session.user.name);
    }
  }, [session?.user.name]);

  async function handleAvatarUploaded(url: string) {
    const { error } = await publicAuthClient.updateUser({ image: url });
    if (error) {
      toast.error(error.message ?? "Couldn't update your photo.");
    }
  }

  async function handleNameSubmit(event: React.FormEvent) {
    event.preventDefault();
    setNameSaving(true);
    const { error } = await publicAuthClient.updateUser({ name });
    setNameSaving(false);

    if (error) {
      toast.error(error.message ?? "Couldn't update your name.");
      return;
    }

    toast.success("Name saved.");
  }

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [location, setLocation] = useState("");

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
      toast.success("Profile saved.");
      await utils.profile.mine.invalidate();
      if (updated?.username) {
        await utils.profile.getByUsername.invalidate({ username: updated.username });
      }
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    update.mutate({ username, bio, websiteUrl, location });
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }

    setPasswordSaving(true);
    const { error: changeError } = await publicAuthClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPasswordSaving(false);

    if (changeError) {
      toast.error(changeError.message ?? "Couldn't change your password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed.");
  }

  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDeleteAccount() {
    setDeleting(true);
    const { error: deleteErr } = await publicAuthClient.deleteUser({ password: deletePassword });
    setDeleting(false);

    if (deleteErr) {
      toast.error(deleteErr.message ?? "Couldn't delete your account.");
      return;
    }

    setDeleteOpen(false);
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="skeleton-shimmer h-64 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <p>Couldn't load your profile. {loadError.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your name and photo, shown across the blog.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <AvatarUpload
                imageUrl={session?.user.image}
                fallback={session?.user.name ? initialsFor(session.user.name) : ""}
                onUploaded={handleAvatarUploaded}
              />
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
            </div>

            <Button type="submit" disabled={nameSaving} className="w-fit gap-2">
              {nameSaving && <Loader2 className="size-4 animate-spin" />}
              Save name
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
          <CardDescription>Shown on your public profile page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
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

            <Button type="submit" disabled={update.isPending} className="btn-glow w-fit gap-2">
              {update.isPending && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={passwordSaving || !currentPassword || !newPassword}
              className="w-fit gap-2"
            >
              {passwordSaving && <Loader2 className="size-4 animate-spin" />}
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account, posts, and comments. This can't be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open);
              if (!open) {
                setDeletePassword("");
              }
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account and everything tied to it. This can't be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="delete-password">Confirm your password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting || !deletePassword}
                  className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={(event) => {
                    event.preventDefault();
                    handleDeleteAccount();
                  }}
                >
                  {deleting && <Loader2 className="size-4 animate-spin" />}
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
