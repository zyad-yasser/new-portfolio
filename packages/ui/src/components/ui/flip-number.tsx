"use client";

import { useEffect, useRef, useState } from "react";
import { formatCompactNumber, formatExactNumber } from "../../lib/format-number";
import { cn } from "../../lib/utils";

type FlipCharProps = {
  char: string;
  animate: boolean;
};

function FlipChar({ char, animate }: FlipCharProps) {
  const [previous, setPrevious] = useState(char);
  const [flipping, setFlipping] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (char === previous) {
      return;
    }

    if (!animate) {
      setPrevious(char);
      return;
    }

    setFlipping(true);
    timeout.current = setTimeout(() => {
      setPrevious(char);
      setFlipping(false);
    }, 320);

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [char, previous, animate]);

  if (!flipping) {
    return <span className="flip-char">{char}</span>;
  }

  return (
    <span className="flip-char flip-char-active">
      <span className="flip-char-outgoing" aria-hidden>
        {previous}
      </span>
      <span className="flip-char-incoming">{char}</span>
    </span>
  );
}

export function FlipNumber({
  value,
  compact = true,
  className,
  label,
}: {
  value: number;
  compact?: boolean;
  className?: string | undefined;
  label?: string | undefined;
}) {
  const [mounted, setMounted] = useState(false);
  const text = compact ? formatCompactNumber(value) : formatExactNumber(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span
      className={cn("flip-number", className)}
      title={label ? `${formatExactNumber(value)} ${label}` : formatExactNumber(value)}
    >
      <span className="sr-only">{label ? `${formatExactNumber(value)} ${label}` : text}</span>
      <span aria-hidden className="flip-number-track">
        {text.split("").map((char, index) => (
          <FlipChar key={index} char={char} animate={mounted} />
        ))}
      </span>
    </span>
  );
}
