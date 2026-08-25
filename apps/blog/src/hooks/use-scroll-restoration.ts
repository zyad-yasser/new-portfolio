"use client";

import { useEffect, useRef } from "react";

// Restores where the user left off after a hard refresh instead of dumping them back at
// the top. Only fires once real content is on screen — callers gate `ready` on the persisted
// query cache having finished rehydrating, otherwise we'd scroll to a position that doesn't
// have enough rendered height yet.
export function useScrollRestoration(key: string, ready: boolean) {
  const restored = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (!ready || restored.current) {
      return;
    }
    restored.current = true;

    const saved = sessionStorage.getItem(key);
    if (saved) {
      // `behavior: "instant"` overrides the app-wide `scroll-behavior: smooth` CSS rule —
      // without it this would visibly animate down the page instead of just being there.
      requestAnimationFrame(() =>
        window.scrollTo({ top: Number(saved), left: 0, behavior: "instant" })
      );
    }
  }, [ready, key]);

  useEffect(() => {
    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sessionStorage.setItem(key, String(window.scrollY));
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [key]);
}
