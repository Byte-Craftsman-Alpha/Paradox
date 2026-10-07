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

type ScrollCallback = (data: { scroll: number; velocity: number }) => void;
const scrollCallbacks = new Set<ScrollCallback>();

export function onScroll(callback: ScrollCallback): () => void {
  scrollCallbacks.add(callback);
  return () => {
    scrollCallbacks.delete(callback);
  };
}

export function setupScroll() {
  const forceDisable = !shouldScrollEnable();
  
  const onNativeScroll = () => {
    scrollCallbacks.forEach((cb) => cb({ scroll: window.scrollY, velocity: 0 }));
  };
  window.addEventListener("scroll", onNativeScroll, { passive: true });

  if (forceDisable) {
    // Native scroll on touch, short viewports and reduced motion.
    return {
      destroy: () => {
        window.removeEventListener("scroll", onNativeScroll);
      },
      forceDisable: true as const,
    };
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.2,
  });

  lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
    scrollCallbacks.forEach((cb) => cb({ scroll: e.scroll, velocity: e.velocity }));
  });

  function raf(time: number) {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onNativeScroll);
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
  const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 80);
  if (lenis) lenis.scrollTo(y, { duration: 0.7 });
  else window.scrollTo({ top: y, behavior: "auto" });
}
