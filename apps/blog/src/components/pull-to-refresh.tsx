"use client";

import { EASE_PREMIUM } from "@repo/ui/lib/motion";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PULL_THRESHOLD = 64;
const MAX_PULL = 96;
const RESISTANCE = 0.5;

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown>;
  children: React.ReactNode;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const pull = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Native listeners, not JSX onTouch*/onMouse* props: React attaches touch handlers as
  // passive by default, so preventDefault() inside onTouchMove would silently no-op and the
  // page would rubber-band/scroll natively underneath our own pull indicator.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    function canStart() {
      return window.scrollY === 0 && !refreshingRef.current;
    }

    function updatePull(currentY: number) {
      if (startYRef.current === null) {
        return;
      }
      const delta = currentY - startYRef.current;

      if (delta <= 0 || window.scrollY > 0) {
        pull.set(0);
        return;
      }

      pull.set(Math.min(delta * RESISTANCE, MAX_PULL));
    }

    async function finishPull() {
      if (startYRef.current === null) {
        return;
      }
      startYRef.current = null;

      if (pull.get() >= PULL_THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        animate(pull, PULL_THRESHOLD, { duration: 0.2, ease: EASE_PREMIUM });
        try {
          await onRefreshRef.current();
        } catch {
          // Best-effort: a failed refresh just snaps the indicator back, no error UI.
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          animate(pull, 0, { duration: 0.3, ease: EASE_PREMIUM });
        }
      } else {
        animate(pull, 0, { duration: 0.25, ease: EASE_PREMIUM });
      }
    }

    function handleTouchStart(event: TouchEvent) {
      if (!canStart()) {
        startYRef.current = null;
        return;
      }
      startYRef.current = event.touches[0]?.clientY ?? null;
    }

    function handleTouchMove(event: TouchEvent) {
      if (startYRef.current === null) {
        return;
      }
      const currentY = event.touches[0]?.clientY ?? startYRef.current;
      if (currentY - startYRef.current > 0 && window.scrollY === 0) {
        event.preventDefault();
      }
      updatePull(currentY);
    }

    function handleMouseMove(event: MouseEvent) {
      updatePull(event.clientY);
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      finishPull();
    }

    function handleMouseDown(event: MouseEvent) {
      if (event.button !== 0 || !canStart()) {
        return;
      }
      startYRef.current = event.clientY;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });
    node.addEventListener("touchend", finishPull);
    node.addEventListener("touchcancel", finishPull);
    node.addEventListener("mousedown", handleMouseDown);

    return () => {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchmove", handleTouchMove);
      node.removeEventListener("touchend", finishPull);
      node.removeEventListener("touchcancel", finishPull);
      node.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pull]);

  const rotate = useTransform(pull, [0, PULL_THRESHOLD], [0, 180]);
  const indicatorOpacity = useTransform(pull, [0, PULL_THRESHOLD / 2], [0, 1]);

  return (
    <div ref={containerRef}>
      <motion.div
        style={{ height: pull, opacity: indicatorOpacity }}
        className="flex items-center justify-center overflow-hidden"
      >
        {refreshing ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <motion.div style={{ rotate }}>
            <ArrowDown className="size-5 text-muted-foreground" />
          </motion.div>
        )}
      </motion.div>
      {children}
    </div>
  );
}
