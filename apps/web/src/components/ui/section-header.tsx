"use client";

import { containerVariants, itemVariants, viewportOnce } from "@/lib/motion";
import { cn } from "@repo/ui/lib/utils";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={containerVariants}
      className={cn("mb-16", isCenter ? "text-center" : "text-left", className)}
    >
      {eyebrow && (
        <motion.p
          variants={itemVariants}
          className="text-sm font-semibold uppercase tracking-widest text-primary mb-3"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        id={id}
        variants={itemVariants}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
      >
        {title}
      </motion.h2>
      <motion.div
        variants={itemVariants}
        className={cn("h-[3px] w-16 rounded-full bg-gradient-brand mb-8", isCenter && "mx-auto")}
      />
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={cn(
            "text-base sm:text-lg text-muted-foreground max-w-3xl",
            isCenter && "mx-auto"
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
