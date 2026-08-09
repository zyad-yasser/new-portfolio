"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AmbientGradientProps {
  variant?: "hero" | "subtle";
  className?: string;
}

const blobBaseStyle = {
  background: "var(--gradient-brand-radial)",
  mixBlendMode: "var(--ambient-glow-blend)",
  opacity: "var(--ambient-glow-opacity)",
  filter: "blur(80px)",
};

interface BlobProps {
  size: string;
  position: React.CSSProperties;
  animate: { x: number[]; y: number[]; scale: number[] };
  duration: number;
  delay?: number;
}

function Blob({ size, position, animate, duration, delay = 0 }: BlobProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`absolute rounded-full ${size}`}
      style={{ ...blobBaseStyle, ...position } as React.CSSProperties}
    >
      <motion.div
        className="w-full h-full"
        animate={shouldReduceMotion ? {} : animate}
        transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay }}
      />
    </div>
  );
}

export function AmbientGradient({ variant = "hero", className }: AmbientGradientProps) {
  if (variant === "subtle") {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className ?? ""}`}>
        <Blob
          size="w-[400px] h-[400px]"
          position={{ top: "-10%", right: "-5%" }}
          animate={{ x: [0, -20, 15, 0], y: [0, 20, -15, 0], scale: [1, 1.05, 0.97, 1] }}
          duration={20}
        />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className ?? ""}`}>
      <Blob
        size="w-[650px] h-[650px]"
        position={{ top: "-15%", right: "-5%" }}
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.95, 1] }}
        duration={20}
      />
      <Blob
        size="w-[500px] h-[500px]"
        position={{ top: "10%", right: "15%" }}
        animate={{ x: [0, -25, 20, 0], y: [0, 25, -20, 0], scale: [1, 0.92, 1.06, 1] }}
        duration={18}
        delay={5}
      />
    </div>
  );
}
