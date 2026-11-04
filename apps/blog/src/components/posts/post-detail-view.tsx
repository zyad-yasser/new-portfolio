"use client";

import { CommentSection } from "@/components/comments/comment-section";
import { TiptapContent } from "@/components/editor/tiptap-content";
import { extractHeadings } from "@/components/editor/toc";
import { AuthorCard } from "@/components/profile/author-card";
import { ReactionBar } from "@/components/reactions/reaction-bar";
import { SiteHeader } from "@/components/site-header";
import type { ResolvedHighlight } from "@/components/study-mode/highlight-extension";
import { HighlightNoteComposer } from "@/components/study-mode/highlight-note-composer";
import { HighlightsTimeline } from "@/components/study-mode/highlights-timeline";
import { ImageAnnotationsList } from "@/components/study-mode/image-annotations-list";
import { MediaAnnotationsLayer } from "@/components/study-mode/media-annotations-layer";
import { SelectionToolbar } from "@/components/study-mode/selection-toolbar";
import { VideoCommentsList } from "@/components/study-mode/video-comments-list";
import { categoryColorClasses } from "@/lib/category-colors";
import { publicAuthClient } from "@repo/auth/public-client";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Label } from "@repo/ui/label";
import { cn } from "@repo/ui/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui/sheet";
import { Skeleton } from "@repo/ui/skeleton";
import { Switch } from "@repo/ui/switch";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Eye,
  Highlighter,
  Library,
  Loader2,
  NotebookPen,
  UserX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function PostDetailView({ slug }: { slug: string }) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const { data: post, isLoading, error } = publicApi.post.getBySlug.useQuery({ slug });
  const incrementView = publicApi.post.incrementView.useMutation();
  const hasTrackedView = useRef(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const [studyMode, setStudyMode] = useState(false);
  const [activeTool, setActiveTool] = useState<"highlight" | "circle">("highlight");
  const [resolvedMap, setResolvedMap] = useState<Record<string, boolean>>({});
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [composerAnchor, setComposerAnchor] = useState<HTMLElement | null>(null);
  const [timelineSheetOpen, setTimelineSheetOpen] = useState(false);

  const blockAuthor = publicApi.block.block.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
      toast.success("User blocked.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't block this user.")),
  });

  const highlightsQuery = publicApi.highlight.listMineForPost.useQuery(
    { postId: post?.id ?? "" },
    { enabled: studyMode && !!session && !!post }
  );
  const highlights = useMemo(() => highlightsQuery.data ?? [], [highlightsQuery.data]);

  const anchoredHighlights = useMemo(
    () =>
      highlights.map((highlight) => ({
        id: highlight.id,
        quoteText: highlight.quoteText,
        prefixText: highlight.prefixText,
        suffixText: highlight.suffixText,
        startOffset: highlight.startOffset,
        color: highlight.color,
      })),
    [highlights]
  );

  const activeHighlight = useMemo(() => {
    if (!activeHighlightId) return null;
    const found = highlights.find((highlight) => highlight.id === activeHighlightId);
    return found
      ? {
          id: found.id,
          quoteText: found.quoteText,
          color: found.color,
          noteJson: found.noteJson,
        }
      : null;
  }, [activeHighlightId, highlights]);

  const videoCommentsQuery = publicApi.videoComment.listMineForPost.useQuery(
    { postId: post?.id ?? "" },
    { enabled: studyMode && !!session && !!post }
  );
  const videoComments = useMemo(() => videoCommentsQuery.data ?? [], [videoCommentsQuery.data]);

  const circleAnnotationsQuery = publicApi.imageAnnotation.listMineForPost.useQuery(
    { postId: post?.id ?? "" },
    { enabled: studyMode && !!session && !!post }
  );
  const circleAnnotations = useMemo(
    () => circleAnnotationsQuery.data ?? [],
    [circleAnnotationsQuery.data]
  );

  const studyDataLoading =
    studyMode &&
    (highlightsQuery.isLoading || videoCommentsQuery.isLoading || circleAnnotationsQuery.isLoading);

  const headings = useMemo(() => (post ? extractHeadings(post.contentJson) : []), [post]);

  useEffect(() => {
    if (post && !hasTrackedView.current) {
      hasTrackedView.current = true;
      incrementView.mutate({ id: post.id });
    }
  }, [post, incrementView]);

  function openHighlight(id: string, attempt = 0) {
    const element = document.querySelector<HTMLElement>(`[data-highlight-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setComposerAnchor(element);
      setActiveHighlightId(id);
      return;
    }
    if (attempt < 60) {
      requestAnimationFrame(() => openHighlight(id, attempt + 1));
      return;
    }
    setComposerAnchor(null);
    setActiveHighlightId(id);
  }

  function closeComposer() {
    setActiveHighlightId(null);
    setComposerAnchor(null);
  }

  function handleHighlightCreated(created: { id: string }) {
    openHighlight(created.id);
  }

  function handleHighlightPersisted(optimisticId: string, realId: string) {
    setActiveHighlightId((current) => (current === optimisticId ? realId : current));
  }

  function handleHighlightsResolved(resolved: ResolvedHighlight[]) {
    setResolvedMap(Object.fromEntries(resolved.map((entry) => [entry.id, entry.found])));
  }

  function jumpToVideo(videoSrc: string, timestampSeconds: number) {
    const videos = articleRef.current?.querySelectorAll("video") ?? [];
    const target = [...videos].find((video) => (video.currentSrc || video.src) === videoSrc);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.currentTime = timestampSeconds;
  }

  function jumpToCircle(id: string) {
    const target = document.querySelector<SVGCircleElement>(`[data-annotation-id="${id}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
          <Skeleton className="skeleton-shimmer h-4 w-40" />
          <Skeleton className="skeleton-shimmer h-9 w-2/3" />
          <Skeleton className="skeleton-shimmer h-4 w-1/3" />
          <Skeleton className="skeleton-shimmer h-64 w-full" />
        </main>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Post not found</h1>
          <p className="text-muted-foreground">This post doesn't exist, or isn't published yet.</p>
          <Button asChild variant="outline">
            <Link href="/">Back to blog</Link>
          </Button>
        </main>
      </>
    );
  }

  const colors = categoryColorClasses(post.category?.color);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground hover:underline">
            Blog
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-foreground">
            {post.title ?? (post.type === "quote" ? "Quote" : "Post")}
          </span>
        </nav>

        {post.coverImageUrl && (
          <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {!post.published && <Badge variant="outline">Draft</Badge>}
            {post.category && (
              <Badge variant="outline" className={colors.badge}>
                {post.category.name}
              </Badge>
            )}
          </div>
          {post.title && <h1 className="text-3xl font-semibold">{post.title}</h1>}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {post.author.profile ? (
                <Link
                  href={`/u/${post.author.profile.username}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {post.author.name}
                </Link>
              ) : (
                post.author.name
              )}
              {session && session.user.id !== post.authorId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  title={`Block ${post.author.name}`}
                  aria-label={`Block ${post.author.name}`}
                  disabled={blockAuthor.isPending}
                  onClick={() => blockAuthor.mutate({ userId: post.authorId })}
                >
                  <UserX className="size-3.5" />
                </Button>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {post.readingMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {post.viewCount} {post.viewCount === 1 ? "view" : "views"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ReactionBar postId={post.id} />
            <div className="flex items-center gap-3">
              {studyMode && (
                <div className="flex items-center gap-1 rounded-md border border-input p-0.5">
                  <Button
                    type="button"
                    variant={activeTool === "highlight" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-9"
                    aria-label="Highlight tool"
                    aria-pressed={activeTool === "highlight"}
                    onClick={() => setActiveTool("highlight")}
                  >
                    <Highlighter className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={activeTool === "circle" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-9"
                    aria-label="Circle tool"
                    aria-pressed={activeTool === "circle"}
                    onClick={() => setActiveTool("circle")}
                  >
                    <Circle className="size-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Label htmlFor="study-mode" className="text-sm text-muted-foreground">
                  Study mode
                </Label>
                {studyDataLoading && (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                )}
                <Switch id="study-mode" checked={studyMode} onCheckedChange={setStudyMode} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div ref={articleRef} className="relative flex min-w-0 flex-col gap-4">
            <TiptapContent
              json={post.contentJson}
              studyMode={studyMode}
              highlights={anchoredHighlights}
              onHighlightClick={(id) => openHighlight(id)}
              onHighlightsResolved={handleHighlightsResolved}
            />

            <MediaAnnotationsLayer
              postId={post.id}
              articleRef={articleRef}
              studyMode={studyMode}
              activeTool={activeTool}
              videoComments={videoComments}
              circleAnnotations={circleAnnotations}
              session={session ?? null}
            />

            {post.type === "quote" &&
              (post.quotedPost ? (
                <Link
                  href={`/post/${post.quotedPost.slug}`}
                  className="flex flex-col gap-1 rounded-lg border border-border/60 p-4 hover:border-primary"
                >
                  <span className="text-sm font-medium">{post.quotedPost.author.name}</span>
                  {post.quotedPost.title && (
                    <span className="font-medium">{post.quotedPost.title}</span>
                  )}
                  {post.quotedPost.excerptText && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {post.quotedPost.excerptText}
                    </p>
                  )}
                </Link>
              ) : (
                <p className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                  This post is no longer available.
                </p>
              ))}
          </div>

          <aside
            className={cn(
              "flex-col gap-4",
              studyMode ? "hidden lg:flex" : "order-first flex lg:order-none"
            )}
          >
            {studyMode ? (
              <>
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Highlights
                </span>
                {studyDataLoading ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="skeleton-shimmer h-20 w-full" />
                    <Skeleton className="skeleton-shimmer h-20 w-full" />
                  </div>
                ) : (
                  <>
                    <HighlightsTimeline
                      postId={post.id}
                      highlights={highlights}
                      resolvedMap={resolvedMap}
                      hasSession={!!session}
                      onJumpTo={openHighlight}
                      onEditNote={openHighlight}
                    />
                    <VideoCommentsList
                      postId={post.id}
                      comments={videoComments}
                      onJumpTo={jumpToVideo}
                    />
                    <ImageAnnotationsList
                      postId={post.id}
                      annotations={circleAnnotations}
                      onJumpTo={jumpToCircle}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {post.author.profile && <AuthorCard username={post.author.profile.username} />}

                {post.series && post.seriesContext && (
                  <Card className="glass flex flex-col gap-3 p-4">
                    <Link
                      href={`/series/${post.series.slug}`}
                      className="flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                      <Library className="size-4 shrink-0 text-muted-foreground" />
                      {post.series.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Part {post.seriesContext.position} of {post.seriesContext.total}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      {post.seriesContext.prevSlug ? (
                        <Button asChild variant="outline" size="sm" className="gap-1">
                          <Link href={`/post/${post.seriesContext.prevSlug}`}>
                            <ChevronLeft className="size-3.5" />
                            Prev
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-1" disabled>
                          <ChevronLeft className="size-3.5" />
                          Prev
                        </Button>
                      )}
                      {post.seriesContext.nextSlug ? (
                        <Button asChild variant="outline" size="sm" className="gap-1">
                          <Link href={`/post/${post.seriesContext.nextSlug}`}>
                            Next
                            <ChevronRight className="size-3.5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-1" disabled>
                          Next
                          <ChevronRight className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                )}

                {post.tags.length > 0 && (
                  <Card className="glass flex flex-col gap-2 p-4">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {headings.length >= 2 && (
                  <Card className="glass flex flex-col gap-2 p-4">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      On this page
                    </span>
                    <nav className="flex flex-col gap-1.5 text-sm">
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={cn(
                            "text-muted-foreground hover:text-foreground hover:underline",
                            heading.level === 3 && "pl-3"
                          )}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </Card>
                )}
              </>
            )}
          </aside>
        </div>

        <CommentSection postId={post.id} postAuthorId={post.authorId} />
      </main>

      {studyMode && (
        <>
          {activeTool === "highlight" && (
            <SelectionToolbar
              postId={post.id}
              containerRef={articleRef}
              session={session ?? null}
              onHighlightCreated={handleHighlightCreated}
              onHighlightPersisted={handleHighlightPersisted}
            />
          )}

          <HighlightNoteComposer
            postId={post.id}
            highlight={activeHighlight}
            anchorElement={composerAnchor}
            onClose={closeComposer}
          />

          <Button
            className="fixed right-6 bottom-6 z-40 gap-2 shadow-lg lg:hidden"
            onClick={() => setTimelineSheetOpen(true)}
          >
            {studyDataLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <NotebookPen className="size-4" />
            )}
            {studyDataLoading
              ? "Loading…"
              : highlights.length + videoComments.length + circleAnnotations.length > 0
                ? highlights.length + videoComments.length + circleAnnotations.length
                : "Notes"}
          </Button>

          <Sheet open={timelineSheetOpen} onOpenChange={setTimelineSheetOpen}>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Your notes</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
                {studyDataLoading ? (
                  <>
                    <Skeleton className="skeleton-shimmer h-20 w-full" />
                    <Skeleton className="skeleton-shimmer h-20 w-full" />
                  </>
                ) : (
                  <>
                    <HighlightsTimeline
                      postId={post.id}
                      highlights={highlights}
                      resolvedMap={resolvedMap}
                      hasSession={!!session}
                      onJumpTo={(id) => {
                        setTimelineSheetOpen(false);
                        openHighlight(id);
                      }}
                      onEditNote={(id) => {
                        setTimelineSheetOpen(false);
                        openHighlight(id);
                      }}
                    />
                    <VideoCommentsList
                      postId={post.id}
                      comments={videoComments}
                      onJumpTo={(src, ts) => {
                        setTimelineSheetOpen(false);
                        jumpToVideo(src, ts);
                      }}
                    />
                    <ImageAnnotationsList
                      postId={post.id}
                      annotations={circleAnnotations}
                      onJumpTo={(id) => {
                        setTimelineSheetOpen(false);
                        jumpToCircle(id);
                      }}
                    />
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </>
  );
}
