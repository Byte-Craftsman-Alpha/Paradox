import type { Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION = {
  micro: { duration: 0.18, ease: EASE },
  ui: { duration: 0.32, ease: EASE },
  section: { duration: 0.66, ease: EASE },
};

export const SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: MOTION.section },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: MOTION.ui },
};

export const maskReveal: Variants = {
  hidden: { y: "100%" },
  show: { y: "0%", transition: { duration: 0.78, ease: EASE } },
};

export const containerStagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const lineItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: MOTION.ui },
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function coarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function shortViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerHeight < 720;
}

export const EASE_STR = "cubic-bezier(0.22, 1, 0.36, 1)";
