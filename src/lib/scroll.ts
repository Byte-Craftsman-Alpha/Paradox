"use client";
import Lenis from "lenis";
import { prefersReducedMotion, coarsePointer, shortViewport } from "./motion";

let lenis: Lenis | null = null;
let rafId = 0;

function shouldScrollEnable(): boolean {
  return (
    !prefersReducedMotion() &&
    !coarsePointer() &&
    !shortViewport()
  );
}

export function setupScroll() {
  const forceDisable = !shouldScrollEnable();
  if (forceDisable) {
    // Native scroll on touch, short viewports and reduced motion.
    return { destroy: () => {}, forceDisable: true as const };
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.2,
  });

  function raf(time: number) {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    },
    forceDisable: false as const,
  };
}

export function getLenis() {
  return lenis;
}

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const y = target.getBoundingClientRect().top + window.scrollY - 80;
  if (lenis) lenis.scrollTo(y, { duration: 0.7 });
  else window.scrollTo({ top: y, behavior: "auto" });
}
