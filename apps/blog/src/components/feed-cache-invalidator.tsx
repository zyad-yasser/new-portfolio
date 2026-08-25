"use client";

import { publicApi } from "@repo/trpc/public/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SCROLL_STORAGE_KEYS = [
  "blog-home-scroll",
  "blog-feed-scroll:following",
  "blog-feed-scroll:all",
];

// The feeds' query caches are meant to survive a hard refresh (see the persisted-query-client
// setup in layout.tsx) but not an in-app navigation — leaving a feed for another page and
// coming back shouldn't show whatever was on screen (or scrolled to) minutes ago.
// `previousPathname` is seeded from the first render, so this only clears on an actual route
// change, never on the initial mount (which would otherwise immediately wipe the just-restored
// persisted cache).
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
