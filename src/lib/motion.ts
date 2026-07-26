import type { Variants } from "framer-motion";

export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

export const viewportOnce = { once: true, margin: "-100px" } as const;

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const containerVariantsSlow: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_PREMIUM } },
};

export const itemVariantsX: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_PREMIUM } },
};
