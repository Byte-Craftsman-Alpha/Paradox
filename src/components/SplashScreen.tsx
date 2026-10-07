"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion, EASE } from "@/lib/motion";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "morphing" | "complete">("loading");

  useEffect(() => {
    const isReduced = prefersReducedMotion();
    const isTest = typeof window !== "undefined" && (window.navigator.webdriver || window.location.search.includes("notimer"));

    if (isReduced || isTest) {
      const t = setTimeout(() => {
        setPhase("complete");
        onComplete?.();
      }, 0);
      return () => clearTimeout(t);
    }

    // Smooth counter tick up to 100% over 1050ms
    const startTime = performance.now();
    const duration = 1050;

    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => {
          setPhase("morphing");
          setTimeout(() => {
            setPhase("complete");
            onComplete?.();
          }, 850);
        }, 150);
      }
    };

    rafId = requestAnimationFrame(tick);

    // Allow user to click or press any key to instantly complete
    const handleSkip = () => {
      cancelAnimationFrame(rafId);
      setProgress(100);
      setPhase("morphing");
      setTimeout(() => {
        setPhase("complete");
        onComplete?.();
      }, 300);
    };

    window.addEventListener("keydown", handleSkip, { once: true });
    window.addEventListener("pointerdown", handleSkip, { once: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleSkip);
      window.removeEventListener("pointerdown", handleSkip);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <div
          aria-label="Loading site contents"
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden"
        >
          {/* Top Curtain */}
          <motion.div
            initial={{ y: "0%" }}
            animate={{ y: phase === "morphing" ? "-100%" : "0%" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-[var(--bg)] border-b border-[var(--hairline)] flex flex-col justify-between p-6 sm:p-12 z-20"
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--meta)] font-mono">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--fg)] animate-pulse" />
                <span>Team Paradox · OS v0.1.0</span>
              </span>
              <span>Gorakhpur, India</span>
            </div>

            <div className="max-w-[1440px] mx-auto w-full flex flex-col items-center justify-end pb-4 text-center">
              <span className="text-[12px] uppercase tracking-[0.24em] text-[var(--meta)] font-mono mb-2">
                Initializing Digital Architecture
              </span>
              <h1 className="text-[clamp(2.2rem,6vw,5.5rem)] font-light leading-none tracking-[-0.03em] text-[var(--fg)]">
                PARADOX
              </h1>
            </div>
          </motion.div>

          {/* Bottom Curtain */}
          <motion.div
            initial={{ y: "0%" }}
            animate={{ y: phase === "morphing" ? "100%" : "0%" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-[var(--bg)] border-t border-[var(--hairline)] flex flex-col justify-between p-6 sm:p-12 z-20"
          >
            <div className="max-w-[1440px] mx-auto w-full flex flex-col items-center justify-start pt-4 text-center">
              <p className="text-[14px] sm:text-[16px] text-[var(--fg-soft)] tracking-[-0.01em] italic font-light max-w-[48ch]">
                Contradiction, engineered. Five builders, one quiet operating system.
              </p>

              {/* Progress Bar & Counter */}
              <div className="w-full max-w-[420px] mt-8">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono mb-2">
                  <span>Mounting Specimen</span>
                  <span className="tabular-nums font-semibold text-[var(--fg)]">{String(progress).padStart(3, "0")}%</span>
                </div>
                <div className="h-[2px] w-full bg-[var(--milk-3)] dark:bg-[var(--line-dark)] overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--fg)]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--meta)] font-mono">
              <span className="hidden sm:inline">WebGL 3D Specimen // Three.js</span>
              <span>Tap anywhere to enter</span>
            </div>
          </motion.div>

          {/* Center Morphing Aperture / Emblem */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: phase === "morphing" ? 1.8 : 1,
              opacity: phase === "morphing" ? 0 : 1,
            }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-[var(--fg)] flex items-center justify-center bg-[var(--bg)] shadow-lg">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--fg)]">
                0xPX
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
