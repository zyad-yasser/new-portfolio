"use client";

import { NotificationsDropdown } from "@/components/notifications-dropdown";
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
import {
  Bookmark,
  FileText,
  Image as ImageIcon,
  Library,
  LogOut,
  PenLine,
  Search,
  Settings,
  User,
} from "lucide-react";
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
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-primary-foreground">
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
                <NotificationsDropdown unreadCount={unreadCount} />
                <Button asChild size="sm" className="btn-glow gap-2">
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
                  <DropdownMenuContent
                    align="end"
                    className="glass-strong w-64 rounded-xl p-1.5 shadow-xl"
                  >
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <Avatar size="sm" className="shrink-0">
                        <AvatarImage
                          src={session.user.image ?? undefined}
                          alt={session.user.name}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{session.user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {myProfile && (
                      <DropdownMenuItem asChild>
                        <Link href={`/u/${myProfile.username}`}>
                          <User />
                          My profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/mine">
                        <FileText />
                        My posts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/series/mine">
                        <Library />
                        My series
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/media">
                        <ImageIcon />
                        Media library
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved">
                        <Bookmark />
                        Saved posts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile">
                        <Settings />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                      <LogOut />
                      Sign out
                    </DropdownMenuItem>
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
