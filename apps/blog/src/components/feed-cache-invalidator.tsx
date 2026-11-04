"use client";

import { publicApi } from "@repo/trpc/public/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SCROLL_STORAGE_KEYS = [
  "blog-home-scroll",
  "blog-feed-scroll:following",
  "blog-feed-scroll:all",
];

export function FeedCacheInvalidator() {
  const pathname = usePathname();
  const utils = publicApi.useUtils();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      utils.post.list.reset();
      utils.feed.following.reset();
      utils.feed.all.reset();
      for (const key of SCROLL_STORAGE_KEYS) {
        sessionStorage.removeItem(key);
      }
    }
  }, [pathname, utils]);

  return null;
}
