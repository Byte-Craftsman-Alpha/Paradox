"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

interface SplashScreenProps {
  onComplete?: () => void;
}

// Snappy physical shutter curve (realistic inertia)
const SHUTTER_EASE = [0.76, 0, 0.24, 1] as const;

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");

  useEffect(() => {
    // 1. Guard against mid-browsing re-triggers: run once per session only
    const seen = sessionStorage.getItem("paradox_splash_seen");
    const isReduced = prefersReducedMotion();
    const isTest = typeof window !== "undefined" && (window.navigator.webdriver || window.location.search.includes("notimer"));

    if (seen || isReduced || isTest) {
      onComplete?.();
      return;
    }

    // Mark as seen immediately so intra-route navigation never re-triggers it
    sessionStorage.setItem("paradox_splash_seen", "true");

    // 2. Snappy progress tick (380ms total)
    const startTime = performance.now();
    const duration = 380;
    let rafId = 0;

    const tick = (now: number) => {
      setIsVisible(true);
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        // Snappy transition into physical reveal after a brief 60ms pause
        setTimeout(() => {
          setPhase("reveal");
          setTimeout(() => {
            setPhase("done");
            setIsVisible(false);
            onComplete?.();
          }, 520);
        }, 60);
      }
    };

    rafId = requestAnimationFrame(tick);

    // Instant bypass on user interaction (key or click)
    const handleSkip = () => {
      cancelAnimationFrame(rafId);
      setPhase("reveal");
      setTimeout(() => {
        setPhase("done");
        setIsVisible(false);
        onComplete?.();
      }, 200);
    };

    window.addEventListener("keydown", handleSkip, { once: true });
    window.addEventListener("pointerdown", handleSkip, { once: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleSkip);
      window.removeEventListener("pointerdown", handleSkip);
    };
  }, [onComplete]);

  if (!isVisible && phase === "done") {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && phase !== "done" && (
        <motion.div
          initial={{ y: "0%" }}
          animate={{ y: phase === "reveal" ? "-100%" : "0%" }}
          transition={{ duration: 0.52, ease: SHUTTER_EASE }}
          aria-hidden="true"
          className="fixed inset-0 z-[9999] bg-[var(--bg)] border-b border-[var(--hairline)] flex flex-col justify-between p-6 sm:p-10 select-none shadow-2xl pointer-events-auto"
        >
          {/* Top minimal header */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--meta)] font-mono">
            <span>Team Paradox</span>
            <span>01 · 2026</span>
          </div>

          {/* Minimalist Centerpiece */}
          <div className="flex flex-col items-center justify-center text-center max-w-[360px] mx-auto w-full">
            <motion.div
              animate={{ opacity: phase === "reveal" ? 0 : 1, y: phase === "reveal" ? -16 : 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full flex flex-col items-center"
            >
              <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-light tracking-[0.22em] text-[var(--fg)] uppercase mb-6">
                Paradox
              </h1>

              {/* Minimal 1px hairline progress line */}
              <div className="w-full h-px bg-[var(--hairline)] relative overflow-hidden mb-3">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-[var(--fg)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              {/* Quiet tabular percentage */}
              <div className="flex items-center justify-between w-full text-[10px] uppercase tracking-[0.2em] text-[var(--meta)] font-mono">
                <span>Init</span>
                <span className="tabular-nums font-semibold text-[var(--fg)]">
                  {String(progress).padStart(3, "0")}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom subtle metadata */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--meta)] font-mono">
            <span>Gorakhpur, India</span>
            <span>Contradiction, engineered</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
