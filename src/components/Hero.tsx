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

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 36]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0.4]);
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 20]);

  return (
    <section
      ref={heroRef}
      id="top"
      data-snap-section
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-14"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-7 grid grid-cols-12 gap-y-10">
        {/* Top meta row */}
        <div className="col-span-12 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
          <span className="flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--meta)]" />
            <span>Index · 001</span>
          </span>
          <span className="hidden md:inline">Five builders · Gorakhpur, India</span>
          <span className="hidden sm:inline">Open to ambitious collaborations</span>
        </div>

        {/* Headline with scroll depth */}
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="col-span-12"
        >
          <h1 className="font-medium leading-[0.96] tracking-[-0.025em] text-[clamp(3.5rem,10vw,8.5rem)]">
            <span className="block text-[var(--fg-soft)]">Team Paradox —</span>
            <span className="block">Contradiction,</span>
            <span className="block italic font-light text-[var(--fg-soft)]" style={{ fontStyle: "italic" }}>
              engineered.
            </span>
          </h1>
        </motion.div>

        {/* PARA / DOX typographic composition with interactive 3D Spline */}
        <div className="col-span-12 grid grid-cols-12 gap-5">
          <div className="hidden md:block col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] pt-3">
            <span className="block">Contradiction</span>
            <span className="block">+ Alignment</span>
            <span className="block mt-3 text-[var(--fg-soft)]">¶</span>
          </div>

          <div className="col-span-12 md:col-span-9 relative">
            <Paradox reduced={reduced} />
          </div>
        </div>

        {/* Sub + CTA with scroll depth */}
        <motion.div
          style={{ y: ctaY }}
          className="col-span-12 grid grid-cols-12 gap-5 mt-4"
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

        {/* Tiny line */}
        <div className="col-span-12 mt-8 hairline-t pt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] flex flex-wrap items-center gap-x-6 gap-y-2">
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

function Paradox({ reduced }: { reduced: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Scroll parallax for PARA / DOX typography
  const paraX = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 20, reduced ? 0 : -30]);
  const doxX = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -20, reduced ? 0 : 30]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="relative aspect-[16/7] sm:aspect-[16/5] w-full overflow-hidden border-y bg-[var(--bg)]"
        style={{ borderColor: "var(--hairline)" }}
      >
        {/* Real-time 3D Spline Canvas */}
        <HeroSpline />

        {/* Floating Typography with Scroll Parallax */}
        <div className="absolute inset-0 grid grid-cols-2 place-items-center text-center pointer-events-none z-10">
          <motion.div
            style={{ x: paraX }}
            className="text-[clamp(3.8rem,16vw,10.5rem)] font-light leading-none tracking-[-0.04em] text-[var(--fg)] select-none opacity-90"
          >
            PARA
          </motion.div>
          <motion.div
            style={{ x: doxX }}
            className="text-[clamp(3.8rem,16vw,10.5rem)] font-light leading-none tracking-[-0.04em] text-[var(--fg-soft)] select-none opacity-90"
          >
            DOX
          </motion.div>
        </div>

        {/* Central hairline cross */}
        <div
          className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--hairline)] pointer-events-none z-10 opacity-70"
          aria-hidden
        />

        <div className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.22em] text-[var(--meta)] pointer-events-none z-10 font-mono">
          ⏤ Team Paradox
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-[0.22em] text-[var(--meta)] pointer-events-none z-10 font-mono">
          alignment motif ⏤
        </div>
      </div>
    </div>
  );
}
