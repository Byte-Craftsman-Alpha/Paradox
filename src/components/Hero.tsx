"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { scrollToId } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { HeroSpline } from "./HeroSpline";

export function Hero() {
  const reduced = prefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 36]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0.4]);
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 20]);

  // Scroll parallax for PARA / DOX watermark typography across 3D stage
  const { scrollYProgress: stageScroll } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const paraX = useTransform(stageScroll, [0, 1], [reduced ? 0 : 24, reduced ? 0 : -36]);
  const doxX = useTransform(stageScroll, [0, 1], [reduced ? 0 : -24, reduced ? 0 : 36]);

  return (
    <section
      ref={heroRef}
      id="top"
      data-snap-section
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-20 sm:pt-24 pb-10 sm:pb-14"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-7 flex flex-col gap-y-8 sm:gap-y-10">
        
        {/* 1. FRONT & CENTER: 3D ARTIFACT STAGE (Between Top Bar and Index Section) */}
        <div ref={stageRef} className="w-full relative mt-2 sm:mt-4">
          <div
            className="relative aspect-[16/8] sm:aspect-[21/9] md:h-[460px] w-full overflow-hidden border-y sm:border bg-[var(--bg)]"
            style={{ borderColor: "var(--hairline)" }}
          >
            {/* Real-time 3D Catmull-Rom Spline & Gyroscopic Core Canvas */}
            <HeroSpline />

            {/* Floating Typography with Scroll Parallax */}
            <div className="absolute inset-0 grid grid-cols-2 place-items-center text-center pointer-events-none z-10">
              <motion.div
                style={{ x: paraX }}
                className="text-[clamp(3.5rem,14vw,9.5rem)] font-light leading-none tracking-[-0.04em] text-[var(--fg)] select-none opacity-85"
              >
                PARA
              </motion.div>
              <motion.div
                style={{ x: doxX }}
                className="text-[clamp(3.5rem,14vw,9.5rem)] font-light leading-none tracking-[-0.04em] text-[var(--fg-soft)] select-none opacity-85"
              >
                DOX
              </motion.div>
            </div>

            {/* Central hairline cross */}
            <div
              className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--hairline)] pointer-events-none z-10 opacity-70"
              aria-hidden
            />
          </div>
        </div>

        {/* 2. INDEX SECTION: Meta row */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] pt-2 border-t border-[var(--hairline)]">
          <span className="flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--meta)]" />
            <span className="font-semibold text-[var(--fg)]">Index · 001</span>
          </span>
          <span className="hidden md:inline">Five builders · Gorakhpur, India</span>
          <span className="hidden sm:inline">Open to ambitious collaborations</span>
        </div>

        {/* 3. HEADLINE */}
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="w-full"
        >
          <h1 className="font-medium leading-[0.96] tracking-[-0.025em] text-[clamp(3.2rem,8.5vw,7.5rem)]">
            <span className="block text-[var(--fg-soft)]">Team Paradox —</span>
            <span className="block">Contradiction,</span>
            <span className="block italic font-light text-[var(--fg-soft)]" style={{ fontStyle: "italic" }}>
              engineered.
            </span>
          </h1>
        </motion.div>

        {/* 4. SUBHEADLINE + CTAS */}
        <motion.div
          style={{ y: ctaY }}
          className="grid grid-cols-12 gap-5"
        >
          <p className="col-span-12 md:col-span-6 text-[17px] sm:text-[19px] leading-[1.55] text-[var(--fg-soft)] max-w-[56ch]">
            We design and build thoughtful digital systems across <em className="not-italic text-[var(--fg)]">product</em>, <em className="not-italic text-[var(--fg)]">web</em>, <em className="not-italic text-[var(--fg)]">mobile</em>, <em className="not-italic text-[var(--fg)]">AI</em> and <em className="not-italic text-[var(--fg)]">security</em>. Five students, one quiet operating system.
          </p>

          <div className="col-span-12 md:col-span-6 flex flex-col sm:flex-row md:justify-end items-start sm:items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => scrollToId("work")}
              className="group inline-flex items-center gap-3 h-12 px-5 border border-[var(--fg)] text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)] focus-visible:bg-[var(--fg)] focus-visible:text-[var(--bg)] cursor-pointer"
            >
              Explore selected work
              <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollToId("team")}
              className="group inline-flex items-center gap-3 h-12 px-5 text-[13px] uppercase tracking-[0.14em] text-[var(--fg-soft)] hover:text-[var(--fg)] cursor-pointer"
            >
              Meet the team
              <span aria-hidden className="inline-block h-px w-6 bg-current" />
            </button>
          </div>
        </motion.div>

        {/* 5. FOOTER LEDGER */}
        <div className="mt-4 hairline-t pt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>Five builders</span>
          <span aria-hidden className="text-[var(--taupe)]">/</span>
          <span>Gorakhpur, India</span>
          <span aria-hidden className="text-[var(--taupe)]">/</span>
          <span>Open to ambitious collaborations</span>
        </div>
      </div>
    </section>
  );
}
