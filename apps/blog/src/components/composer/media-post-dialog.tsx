"use client";

import { MediaPickerDialog } from "@/components/media/media-picker-dialog";
import type { MediaItem } from "@/components/media/use-media-upload";
import type { TiptapDoc } from "@repo/db/schema";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function buildContentJson(media: MediaItem, caption: string): TiptapDoc {
  const mediaNode: TiptapDoc = media.mimeType.startsWith("video/")
    ? { type: "video", attrs: { src: media.url } }
    : { type: "image", attrs: { src: media.url, alt: media.originalName } };

  const content: TiptapDoc[] = [mediaNode];
  const trimmed = caption.trim();
  if (trimmed) {
    content.push({ type: "paragraph", content: [{ type: "text", text: trimmed }] });
  }

  return { type: "doc", content };
}

export function MediaPostDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const utils = publicApi.useUtils();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [caption, setCaption] = useState("");

  const createPost = publicApi.post.create.useMutation({
    onSuccess: (created) => {
      utils.post.list.invalidate();
      utils.feed.following.invalidate();
      reset();
      onOpenChange(false);
      toast.success("Post published.");
      router.push(`/post/${created.slug}`);
      router.refresh();
    },
    onError: (mutationError) => {
      toast.error(mutationError.message ?? "Couldn't create your post.");
    },
  });

  function reset() {
    setMedia(null);
    setCaption("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
    }
    onOpenChange(next);
  }

  function handlePost() {
    if (!media) {
      return;
    }
    createPost.mutate({
      type: "media",
      contentJson: buildContentJson(media, caption),
      published: true,
    });
  }

  const isVideo = media?.mimeType.startsWith("video/");

  return (
    <>
      <Dialog open={open && !pickerOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create post</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {media ? (
              <div className="relative overflow-hidden rounded-lg border border-border/60 bg-black">
                {isVideo ? (
                  // biome-ignore lint/a11y/useMediaCaption: user-uploaded post media, no caption track available
                  <video src={media.url} controls className="max-h-72 w-full object-contain" />
                ) : (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={media.url}
                      alt={media.originalName}
                      fill
                      sizes="480px"
                      className="object-contain"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 size-7"
                  aria-label="Remove media"
                  onClick={() => setMedia(null)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-28 gap-2 border-dashed"
                onClick={() => setPickerOpen(true)}
              >
                <ImagePlus className="size-5" />
                Add a photo or video
              </Button>
            )}

            <Textarea
              placeholder="Write a caption…"
              rows={3}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />

            <Button
              type="button"
              className="btn-glow w-full gap-2"
              disabled={!media || createPost.isPending}
              onClick={handlePost}
            >
              {createPost.isPending && <Loader2 className="size-4 animate-spin" />}
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setMedia} />
    </>
  );
}
