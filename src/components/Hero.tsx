"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { scrollToId } from "@/lib/scroll";
import { EASE, prefersReducedMotion } from "@/lib/motion";

export function Hero() {
  const reduced = prefersReducedMotion();

  return (
    <section
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

        {/* Headline */}
        <div className="col-span-12">
          <h1 className="font-medium leading-[0.96] tracking-[-0.025em] text-[clamp(3.5rem,10vw,8.5rem)]">
            <span className="block text-[var(--fg-soft)]">Team Paradox —</span>
            <span className="block">Contradiction,</span>
            <span className="block italic font-light text-[var(--fg-soft)]" style={{ fontStyle: "italic" }}>
              engineered.
            </span>
          </h1>
        </div>

        {/* PARA / DOX typographic composition */}
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

        {/* Sub + CTA */}
        <div className="col-span-12 grid grid-cols-12 gap-5 mt-4">
          <p className="col-span-12 md:col-span-6 text-[17px] sm:text-[19px] leading-[1.55] text-[var(--fg-soft)] max-w-[56ch]">
            We design and build thoughtful digital systems across <em className="not-italic text-[var(--fg)]">product</em>, <em className="not-italic text-[var(--fg)]">web</em>, <em className="not-italic text-[var(--fg)]">mobile</em>, <em className="not-italic text-[var(--fg)]">AI</em> and <em className="not-italic text-[var(--fg)]">security</em>. Five students, one quiet operating system.
          </p>

          <div className="col-span-12 md:col-span-6 flex flex-col sm:flex-row md:justify-end items-start sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => scrollToId("work")}
              className="group inline-flex items-center gap-3 h-12 px-5 border border-[var(--fg)] text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)] focus-visible:bg-[var(--fg)] focus-visible:text-[var(--bg)]"
            >
              Explore selected work
              <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden />
            </button>
            <button
              onClick={() => scrollToId("team")}
              className="group inline-flex items-center gap-3 h-12 px-5 text-[13px] uppercase tracking-[0.14em] text-[var(--fg-soft)] hover:text-[var(--fg)]"
            >
              Meet the team
              <span aria-hidden className="inline-block h-px w-6 bg-current" />
            </button>
          </div>
        </div>

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
  // misalignment → alignment reveal
  const initial = { x: reduced ? 0 : -18, y: reduced ? 0 : 14, skewX: reduced ? 0 : -3, opacity: reduced ? 1 : 0.5 };
  const animate = { x: 0, y: 0, skewX: 0, opacity: 1 };

  return (
    <div className="relative w-full">
      <div className="relative aspect-[16/6] sm:aspect-[16/4] w-full overflow-hidden border-y" style={{ borderColor: "var(--hairline)" }}>
        <motion.div
          className="absolute inset-0 grid grid-cols-2 place-items-center text-center"
          initial={initial}
          animate={animate}
          transition={{ duration: reduced ? 0 : 1.4, ease: EASE }}
        >
          <div className="text-[clamp(4rem,18vw,12rem)] font-light leading-none tracking-[-0.04em] text-[var(--fg)]">PARA</div>
          <div className="text-[clamp(4rem,18vw,12rem)] font-light leading-none tracking-[-0.04em] text-[var(--fg-soft)]">DOX</div>
        </motion.div>

        {/* hairline cross */}
        <motion.div
          initial={{ scaleY: 0, opacity: reduced ? 1 : 0.3 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: reduced ? 0 : 1.0, ease: EASE }}
          className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--fg)] origin-top"
          aria-hidden
        />
        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.22em] text-[var(--meta)]">⏤ Team Paradox</div>
        <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-[0.22em] text-[var(--meta)]">alignment motif ⏤</div>
      </div>
    </div>
  );
}
