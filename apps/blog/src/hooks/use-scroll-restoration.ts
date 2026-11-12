"use client";

import { useEffect, useRef } from "react";

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
