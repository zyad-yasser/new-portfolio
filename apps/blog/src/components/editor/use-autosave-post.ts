"use client";

import type { TiptapDoc } from "@repo/db/schema";
import { publicApi } from "@repo/trpc/public/react";
import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type PendingSave = {
  title: string;
  contentJson: TiptapDoc;
  categoryId: string | null;
  tagNames: string[];
};

const AUTOSAVE_DELAY_MS = 1500;

export function useAutosavePost(initialPostId?: string) {
  const utils = publicApi.useUtils();
  const [postId, setPostId] = useState<string | undefined>(initialPostId);
  const [slug, setSlug] = useState<string | undefined>();
  const [status, setStatus] = useState<AutosaveStatus>("idle");

  const createPost = publicApi.post.create.useMutation();
  const updatePost = publicApi.post.update.useMutation();
  const setPublishedMutation = publicApi.post.setPublished.useMutation();

  const postIdRef = useRef(postId);
  postIdRef.current = postId;
  const pendingRef = useRef<PendingSave | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef<Promise<string | undefined> | null>(null);

  const flush = useCallback(async (): Promise<string | undefined> => {
    if (flushingRef.current) {
      return flushingRef.current;
    }

    const pending = pendingRef.current;
    if (!pending || !pending.title.trim()) {
      return postIdRef.current;
    }

    const run = (async () => {
      setStatus("saving");
      try {
        if (!postIdRef.current) {
          const created = await createPost.mutateAsync({
            title: pending.title,
            contentJson: pending.contentJson,
            categoryId: pending.categoryId,
            tagNames: pending.tagNames,
            published: false,
          });
          postIdRef.current = created.id;
          setPostId(created.id);
          setSlug(created.slug);
        } else {
          const updated = await updatePost.mutateAsync({
            id: postIdRef.current,
            title: pending.title,
            contentJson: pending.contentJson,
            categoryId: pending.categoryId,
            tagNames: pending.tagNames,
          });
          setSlug(updated.slug);
        }

        pendingRef.current = null;
        setStatus("saved");
        utils.post.mine.invalidate();
        return postIdRef.current;
      } catch {
        setStatus("error");
        return postIdRef.current;
      } finally {
        flushingRef.current = null;
      }
    })();

    flushingRef.current = run;
    return run;
  }, [createPost, updatePost, utils]);

  const schedule = useCallback(
    (data: PendingSave) => {
      pendingRef.current = data;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        flush();
      }, AUTOSAVE_DELAY_MS);
    },
    [flush]
  );

  const publish = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const id = await flush();
    if (!id) {
      return null;
    }

    const result = await setPublishedMutation.mutateAsync({ id, published: true });
    if (result) {
      setSlug(result.slug);
    }
    utils.post.list.invalidate();
    utils.post.mine.invalidate();
    return result;
  }, [flush, setPublishedMutation, utils]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return { postId, slug, status, schedule, publish, isPublishing: setPublishedMutation.isPending };
}
