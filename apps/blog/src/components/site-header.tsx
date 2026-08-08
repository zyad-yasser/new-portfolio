"use client";

import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Bell, PenLine, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 250;
const UNREAD_POLL_INTERVAL_MS = 30_000;

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = publicAuthClient.useSession();
  const { data: myProfile } = publicApi.profile.mine.useQuery(undefined, { enabled: !!session });
  const { data: unreadCount } = publicApi.notification.unreadCount.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: UNREAD_POLL_INTERVAL_MS,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const trimmedQuery = debouncedQuery.trim();
  const { data: searchResults, isFetching: isSearching } = publicApi.search.posts.useQuery(
    { query: trimmedQuery, limit: 8 },
    { enabled: trimmedQuery.length >= 2 }
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function goToPost(slug: string) {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/post/${slug}`);
  }

  async function handleSignOut() {
    await publicAuthClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = session?.user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              ZY
            </span>
            <span className="text-sm font-semibold">Blog</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/series">Series</Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
              Search
              <kbd className="ml-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
                &#8984;K
              </kbd>
            </Button>

            {!isPending && session && (
              <>
                <Button asChild variant="ghost" size="icon" className="relative">
                  <Link href="/notifications" aria-label="Notifications">
                    <Bell className="size-4" />
                    {!!unreadCount && (
                      <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild size="sm" className="gap-2">
                  <Link href="/new">
                    <PenLine className="size-4" />
                    Write
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar size="sm">
                      <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {myProfile && (
                      <DropdownMenuItem asChild>
                        <Link href={`/u/${myProfile.username}`}>My profile</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/mine">My posts</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/series/mine">My series</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/media">Media library</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved">Saved posts</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile">Edit profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/blocked">Blocked users</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isPending && !session && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <CommandDialog
        open={searchOpen}
        onOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) {
            setSearchQuery("");
          }
        }}
        title="Search posts"
        description="Search posts by title and content"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search posts..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {trimmedQuery.length < 2 && (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          )}
          {trimmedQuery.length >= 2 && !isSearching && searchResults?.items.length === 0 && (
            <CommandEmpty>No posts found.</CommandEmpty>
          )}
          {searchResults && searchResults.items.length > 0 && (
            <CommandGroup heading="Posts">
              {searchResults.items.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => goToPost(result.slug)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{result.title}</span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {result.excerptText}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
